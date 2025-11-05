import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  SubmissionInsert,
  SubmissionRequestBody,
  SubmissionResponse,
} from "@/types/supabase";

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
    } = body;

    // Validate required fields
    if (!companyName || !year || !term || returnOfferExtended === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Get or create company
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
      linkedin_url: linkedinUrl || null,
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
      .eq("status", "accepted")
      .order("submitted_at", { ascending: false });

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
