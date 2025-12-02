import { NextRequest, NextResponse } from "next/server";
import type { Tables } from "@/types/supabase";
import type {
  SubmissionInsert,
  SubmissionRequestBody,
} from "@/types/submission";
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
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabaseServer";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1h"),
});

// Extract LinkedIn profile identifier from URL
// Handles formats like: linkedin.com/in/username, www.linkedin.com/in/username, etc.
function extractLinkedInProfileId(url: string): string | null {
  try {
    const trimmed = url.trim().toLowerCase();
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

function normalizeLinkedInUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export async function POST(request: NextRequest) {
  const userAgentCheck = validateUserAgent(request);
  if (!userAgentCheck.allowed && userAgentCheck.response) {
    return userAgentCheck.response;
  }

  // Rate limit based on IP address
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim() || null;
  const ipAddress = realIp || forwardedIp || "unknown";

  const { success } = await ratelimit.limit(ipAddress);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const contentLength = request.headers.get("content-length");
  const MAX_REQUEST_SIZE = 10 * 1024; // 10KB limit
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

  const supabaseAuth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  // Use service role client for inserts to bypass RLS
  // We've already validated all input server-side, so this is safe
  const supabase = createServiceRoleClient();

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

    const sanitizedSchoolName = schoolName
      ? sanitizeSchoolName(schoolName)
      : null;
    const sanitizedSource = source ? sanitizeSource(source) : null;
    const validatedInternType = internType
      ? validateInternType(internType)
      : null;

    const normalizedLinkedInUrl = normalizeLinkedInUrl(linkedinUrl);
    const linkedInProfileId = extractLinkedInProfileId(linkedinUrl);

    if (!linkedInProfileId) {
      return NextResponse.json(
        { error: "Invalid LinkedIn URL format" },
        { status: 400 }
      );
    }

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

    const { data: existingSubmissions } = await supabase
      .from("submissions")
      .select("id, linkedin_url, company_id, term, year")
      .eq("company_id", company.id)
      .eq("year", validatedYear)
      .eq("term", validatedTerm);

    if (existingSubmissions && existingSubmissions.length > 0) {
      const duplicate = existingSubmissions.find(
        (sub: { linkedin_url: string | null }) => {
          if (!sub.linkedin_url) return false;

          const existingProfileId = extractLinkedInProfileId(sub.linkedin_url);
          return existingProfileId === linkedInProfileId;
        }
      );

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
      position_type: validatedPositionType,
      school_name: sanitizedSchoolName,
      source: sanitizedSource,
      user_id: user?.id || null,
    };

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert(submissionData)
      .select()
      .single();

    if (submissionError) {
      throw submissionError;
    }

    const response = {
      success: true,
      data: submission as Tables<"submissions">,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get("company");
    const year = searchParams.get("year");
    const all = searchParams.get("all") === "true";
    const includeAnalytics = searchParams.get("analytics") === "true";

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
        },
        { status: 401 }
      );
    }

    if (
      user.email !== process.env.ADMIN_EMAIL &&
      user.email !== process.env.ADMIN_EMAIL2
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    let query = supabase
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

    const submissionData = data || [];

    const userMap: Record<
      string,
      {
        email: string | null;
        fullName: string | null;
      }
    > = {};

    const uniqueUserIds = Array.from(
      new Set(
        submissionData
          .map((submission) => submission.user_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (uniqueUserIds.length > 0) {
      const supabaseAdmin = createServiceRoleClient();
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const { data: userData, error: userError } =
            await supabaseAdmin.auth.admin.getUserById(userId);

          if (!userError && userData?.user) {
            const metadata = userData.user.user_metadata ?? {};
            userMap[userId] = {
              email: userData.user.email ?? null,
              fullName:
                typeof metadata.full_name === "string"
                  ? metadata.full_name
                  : null,
            };
          } else if (userError?.message !== "User not found") {
            console.error("Failed to fetch user data", userId, userError);
          }
        })
      );
    }

    const enrichedSubmissionData = submissionData.map((submission) => ({
      ...submission,
      user:
        submission.user_id && userMap[submission.user_id]
          ? userMap[submission.user_id]
          : null,
    }));

    let analytics = null;
    if (includeAnalytics) {
      const analyticsQuery = supabase
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

          bySource[src] = (bySource[src] || 0) + 1;
          bySchool[school] = (bySchool[school] || 0) + 1;

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
      data: typeof enrichedSubmissionData;
      analytics?: typeof analytics;
    } = {
      data: enrichedSubmissionData,
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
