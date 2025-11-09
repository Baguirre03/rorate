import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import type { Tables } from "@/types/supabase";

type SubmissionWithCompany = {
  return_offer_extended: Tables<"submissions">["return_offer_extended"];
  year: Tables<"submissions">["year"];
  companies: Pick<Tables<"companies">, "name">[] | null;
};

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get("company");

    let query = supabase
      .from("submissions")
      .select(
        `
        return_offer_extended,
        year,
        companies (
          name
        )
      `
      )
      .eq("status", "accepted");

    if (companyName) {
      query = query.eq("companies.name", companyName);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data as SubmissionWithCompany[],
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
