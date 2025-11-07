import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  SubmissionInsert,
  SubmissionRequestBody,
  SubmissionResponse,
} from "@/types/supabase";

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

export async function POST(request: NextRequest) {
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

    // Normalize LinkedIn URL
    const normalizedLinkedInUrl = normalizeLinkedInUrl(linkedinUrl);
    const linkedInProfileId = extractLinkedInProfileId(linkedinUrl);

    if (!linkedInProfileId) {
      return NextResponse.json(
        { error: "Invalid LinkedIn URL format" },
        { status: 400 }
      );
    }

    // Check for duplicate submission
    // Match by: LinkedIn profile ID, position_type, term, and year
    const { data: existingSubmissions, error: checkError } = await supabase
      .from("submissions")
      .select("id, linkedin_url, position_type, term, year")
      .eq("year", year)
      .eq("term", term);

    if (checkError) {
      console.error("Error checking for duplicates:", checkError);
      // Continue with submission if check fails (don't block submission)
    } else if (existingSubmissions && existingSubmissions.length > 0) {
      // Check if any existing submission matches LinkedIn profile and position_type
      const duplicate = existingSubmissions.find((sub) => {
        if (!sub.linkedin_url) return false;

        const existingProfileId = extractLinkedInProfileId(sub.linkedin_url);
        const profileMatches = existingProfileId === linkedInProfileId;

        const positionMatches =
          (sub.position_type || null) === (positionType || null);

        return profileMatches && positionMatches;
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

    const submissionData: SubmissionInsert = {
      company_id: company.id,
      year,
      term,
      return_offer_extended: returnOfferExtended,
      status: "waiting",
      intern_type: internType || null,
      linkedin_url: normalizedLinkedInUrl,
      position_type: positionType || null,
    };

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert(submissionData)
      .select()
      .single();

    if (submissionError) throw submissionError;

    const response: SubmissionResponse = {
      success: true,
      data: submission,
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get("company");
    const year = searchParams.get("year");
    const all = searchParams.get("all") === "true"; // For admin view

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

    // Only show accepted submissions for public view
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

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
