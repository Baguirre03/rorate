import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabaseClient";
import {
  SubmissionInsert,
  SubmissionRequestBody,
  Tables,
} from "@/types/supabase";
import { rateLimit } from "@/lib/rateLimit";

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
  // Apply rate limiting: 5 requests per minute per IP for DDoS protection
  const rateLimitResult = rateLimit(request, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  });

  if (!rateLimitResult.allowed && rateLimitResult.response) {
    return rateLimitResult.response;
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

    // Validate positionType - always required
    if (
      !positionType ||
      (positionType !== "Full Time" && positionType !== "Intern")
    ) {
      return NextResponse.json(
        {
          error:
            "Position type is required and must be 'Full Time' or 'Intern'",
        },
        { status: 400 }
      );
    }

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
      .eq("name", companyName)
      .single();

    if (!company) {
      const { data: newCompany, error: createError } = await supabase
        .from("companies")
        .insert({ name: companyName })
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
      .eq("year", year)
      .eq("term", term);

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
      year,
      term,
      return_offer_extended: returnOfferExtended,
      status: "waiting",
      intern_type: internType || null,
      linkedin_url: normalizedLinkedInUrl,
      // Position type is always required (validated above)
      position_type: positionType,
      // Analytics fields
      school_name: schoolName?.trim() || null,
      source: source?.trim() || null,
    };

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert(submissionData)
      .select()
      .single();

    if (submissionError) throw submissionError;

    // Remove analytics fields before sending to frontend
    const sanitizedSubmission = sanitizeSubmission(submission);

    // Type assertion is safe here - we're just removing analytics fields
    const response = {
      success: true,
      data: sanitizedSubmission as Tables<"submissions">,
    };

    // Add rate limit headers to response
    const headers = new Headers();
    if (rateLimitResult.limit) {
      headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
    }
    if (rateLimitResult.remaining !== undefined) {
      headers.set(
        "X-RateLimit-Remaining",
        rateLimitResult.remaining.toString()
      );
    }
    if (rateLimitResult.resetTime) {
      headers.set(
        "X-RateLimit-Reset",
        new Date(rateLimitResult.resetTime).toISOString()
      );
    }

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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
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
