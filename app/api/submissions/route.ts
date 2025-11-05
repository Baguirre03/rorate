import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      year,
      position,
      returnOfferExtended,
      internType,
      school,
      location,
    } = body;

    // Validate required fields
    if (
      !companyName ||
      !year ||
      !position ||
      returnOfferExtended === undefined
    ) {
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

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        company_id: company.id,
        year,
        position,
        return_offer_extended: returnOfferExtended,
        status: "waiting",
        intern_type: internType,
        school,
        location,
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    return NextResponse.json({
      success: true,
      data: submission,
    });
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
