import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabaseClient";
import {
  SubmissionInsert,
  SubmissionRequestBody,
  Tables,
} from "@/types/supabase";
import {
  checkSubmissionLimit,
  incrementSubmissionCount,
} from "@/lib/submissionLimit";
import { validateUserAgent } from "@/lib/userAgentValidation";
import {
  sanitizeCompanyName,
  sanitizeSchoolName,
  sanitizeSource,
  validateYear,
  validateTerm,
  validateInternType,
  validatePositionType,
} from "@/lib/inputSanitization";

// Extract LinkedIn profile identifier from URL
// Handles formats like: linkedin.com/in/username, www.linkedin.com/in/username, etc.
function extractLinkedInProfileId(url: string): string | null {
  try {
    const trimmed = url.trim().toLowerCase();
    // Normalize URL
    let normalized = trimmed;
    if (!normalized.startsWith("http")) {
      normalized = `https://${normalized}`;
    }

    // Extract profile identifier from various LinkedIn URL formats
    const patterns = [
      /linkedin\.com\/in\/([^\/\?&#]+)/i,
      /linkedin\.com\/pub\/([^\/\?&#]+)/i,
      /linkedin\.com\/profile\/view\?id=([^&]+)/i,
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Normalize LinkedIn URL - add https:// if missing
function normalizeLinkedInUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

// Remove analytics fields from submission data before sending to frontend
// Always removes school_name and source (never exposed)
// For admins: keeps linkedin_url; for regular users: removes it (but this endpoint is admin-only now)
function sanitizeSubmission<
  T extends {
    school_name?: string | null;
    source?: string | null;
    linkedin_url?: string | null;
  }
>(submission: T): Omit<T, "school_name" | "source"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    school_name: _school_name,
    source: _source,
    ...sanitized
  } = submission;
  return sanitized;
}

// Remove analytics fields from array of submissions
function sanitizeSubmissions<
  T extends {
    school_name?: string | null;
    source?: string | null;
    linkedin_url?: string | null;
  }
>(submissions: T[]): Array<Omit<T, "school_name" | "source">> {
  return submissions.map(sanitizeSubmission);
}

export async function POST(request: NextRequest) {
  // Layer 1: User Agent Validation - Block curl, wget, and other automated tools
  const userAgentCheck = validateUserAgent(request);
  if (!userAgentCheck.allowed && userAgentCheck.response) {
    return userAgentCheck.response;
  }

  // Layer 2: Submission limit - Maximum 10 submissions per IP
  const submissionLimitCheck = checkSubmissionLimit(request, 10);
  if (!submissionLimitCheck.allowed && submissionLimitCheck.response) {
    return submissionLimitCheck.response;
  }

  // Layer 4: Request size validation
  const contentLength = request.headers.get("content-length");
  const MAX_REQUEST_SIZE = 10 * 1024; // 10KB limit
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

  try {
    const body: SubmissionRequestBody = await request.json();
    const {
      linkedinUrl,
      companyName,
      year,
      term,
      internType,
      returnOfferExtended,
      positionType,
      schoolName,
      source,
    } = body;

    // Validate required fields
    if (
      !linkedinUrl ||
      !companyName ||
      !year ||
      !term ||
      returnOfferExtended === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const sanitizedCompanyName = sanitizeCompanyName(companyName);
    if (!sanitizedCompanyName) {
      return NextResponse.json(
        { error: "Invalid company name" },
        { status: 400 }
      );
    }

    const validatedYear = validateYear(year);
    if (!validatedYear) {
      return NextResponse.json(
        { error: "Invalid year. Must be between 2000 and 2100" },
        { status: 400 }
      );
    }

    const validatedTerm = validateTerm(term);
    if (!validatedTerm) {
      return NextResponse.json({ error: "Invalid term" }, { status: 400 });
    }

    // Validate positionType - always required
    const validatedPositionType = validatePositionType(positionType);
    if (!validatedPositionType) {
      return NextResponse.json(
        {
          error:
            "Position type is required and must be 'Full Time' or 'Intern'",
        },
        { status: 400 }
      );
    }

    // Sanitize optional fields
    const sanitizedSchoolName = schoolName
      ? sanitizeSchoolName(schoolName)
      : null;
    const sanitizedSource = source ? sanitizeSource(source) : null;
    const validatedInternType = internType
      ? validateInternType(internType)
      : null;

    // Normalize LinkedIn URL
    const normalizedLinkedInUrl = normalizeLinkedInUrl(linkedinUrl);
    const linkedInProfileId = extractLinkedInProfileId(linkedinUrl);

    if (!linkedInProfileId) {
      return NextResponse.json(
        { error: "Invalid LinkedIn URL format" },
        { status: 400 }
      );
    }

    // Get or create company first (needed for duplicate check)
    let { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("name", sanitizedCompanyName)
      .single();

    if (!company) {
      const { data: newCompany, error: createError } = await supabase
        .from("companies")
        .insert({ name: sanitizedCompanyName })
        .select("id")
        .single();

      if (createError) throw createError;
      company = newCompany;
    }

    // Check for duplicate submission
    // Match by: LinkedIn profile ID + company_id + year + term
    const { data: existingSubmissions, error: checkError } = await supabase
      .from("submissions")
      .select("id, linkedin_url, company_id, term, year")
      .eq("company_id", company.id)
      .eq("year", validatedYear)
      .eq("term", validatedTerm);

    if (checkError) {
      console.error("Error checking for duplicates:", checkError);
    } else if (existingSubmissions && existingSubmissions.length > 0) {
      const duplicate = existingSubmissions.find((sub) => {
        if (!sub.linkedin_url) return false;

        const existingProfileId = extractLinkedInProfileId(sub.linkedin_url);
        return existingProfileId === linkedInProfileId;
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error: "Duplicate submission found",
            duplicate: true,
          },
          { status: 409 }
        );
      }
    }

    const submissionData: SubmissionInsert = {
      company_id: company.id,
      year: validatedYear,
      term: validatedTerm,
      return_offer_extended: returnOfferExtended,
      status: "waiting",
      intern_type: validatedInternType,
      linkedin_url: normalizedLinkedInUrl,
      // Position type is always required (validated above)
      position_type: validatedPositionType,
      // Analytics fields (sanitized)
      school_name: sanitizedSchoolName,
      source: sanitizedSource,
    };

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert(submissionData)
      .select()
      .single();

    if (submissionError) throw submissionError;

    // Increment submission count for this IP after successful submission
    incrementSubmissionCount(request);

    // Remove analytics fields before sending to frontend
    const sanitizedSubmission = sanitizeSubmission(submission);

    // Type assertion is safe here - we're just removing analytics fields
    const response = {
      success: true,
      data: sanitizedSubmission as Tables<"submissions">,
    };

    // Add submission limit headers to response
    const headers = new Headers();
    // Add submission limit headers
    if (submissionLimitCheck.currentCount !== undefined) {
      headers.set(
        "X-Submission-Count",
        (submissionLimitCheck.currentCount + 1).toString()
      );
    }
    if (submissionLimitCheck.remaining !== undefined) {
      headers.set(
        "X-Submission-Remaining",
        (submissionLimitCheck.remaining - 1).toString()
      );
    }
    headers.set("X-Submission-Limit", "10");

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get("company");
    const year = searchParams.get("year");
    const all = searchParams.get("all") === "true"; // For admin view
    const includeAnalytics = searchParams.get("analytics") === "true";

    // Create server client for database queries
    const client = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Not setting cookies in GET request
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
        },
        { status: 401 }
      );
    }

    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const isAdmin = true;

    let query = client
      .from("submissions")
      .select(
        `
        *,
        companies (
          id,
          name
        )
      `
      )
      .order("submitted_at", { ascending: false });

    if (!all) {
      query = query.eq("status", "accepted");
    }

    if (companyName) {
      query = query.eq("companies.name", companyName);
    }

    if (year) {
      query = query.eq("year", parseInt(year));
    }

    const { data, error } = await query;

    if (error) throw error;

    const sanitizedData = data ? sanitizeSubmissions(data) : [];

    let analytics = null;
    if (includeAnalytics && isAdmin) {
      const analyticsQuery = client
        .from("submissions")
        .select("school_name, source, id, status");

      const { data: analyticsData, error: analyticsError } =
        await analyticsQuery;

      if (!analyticsError && analyticsData) {
        const bySource: Record<string, number> = {};
        const bySchool: Record<string, number> = {};
        const bySourceAndSchool: Record<string, number> = {};

        analyticsData.forEach((submission) => {
          const school = submission.school_name || "Unknown";
          const src = submission.source || "Unknown";
          const key = `${src}::${school}`;

          // Count by source
          bySource[src] = (bySource[src] || 0) + 1;

          // Count by school
          bySchool[school] = (bySchool[school] || 0) + 1;

          // Count by source and school combination
          bySourceAndSchool[key] = (bySourceAndSchool[key] || 0) + 1;
        });

        analytics = {
          total: analyticsData.length,
          bySource: Object.entries(bySource)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count),
          bySchool: Object.entries(bySchool)
            .map(([school_name, count]) => ({ school_name, count }))
            .sort((a, b) => b.count - a.count),
          bySourceAndSchool: Object.entries(bySourceAndSchool)
            .map(([key, count]) => {
              const [source, school_name] = key.split("::");
              return { source, school_name, count };
            })
            .sort((a, b) => b.count - a.count),
        };
      }
    }

    const responseData: {
      data: typeof sanitizedData;
      analytics?: typeof analytics;
    } = {
      data: sanitizedData,
    };

    if (analytics) {
      responseData.analytics = analytics;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
