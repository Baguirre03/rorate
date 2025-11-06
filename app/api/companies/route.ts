import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    let query = supabase
      .from("submissions")
      .select(
        `
        return_offer_extended,
        companies (
          id,
          name
        )
      `
      )
      .eq("status", "accepted")
      .eq("year", 2025);

    if (search) {
      query = query.ilike("companies.name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ data: [] });
    }

    const companyStats = new Map<
      string,
      { name: string; total: number; offers: number; percentage: number }
    >();

    data.forEach((submission) => {
      // Handle Supabase's response structure
      const companies = Array.isArray(submission.companies)
        ? submission.companies[0]
        : submission.companies;
      const companyName = companies?.name;
      if (!companyName) return;

      if (!companyStats.has(companyName)) {
        companyStats.set(companyName, {
          name: companyName,
          total: 0,
          offers: 0,
          percentage: 0,
        });
      }

      const stats = companyStats.get(companyName)!;
      stats.total++;
      if (
        submission.return_offer_extended !== undefined &&
        submission.return_offer_extended
      ) {
        stats.offers++;
      }
    });

    // Calculate percentages and convert to array
    const companies = Array.from(companyStats.values())
      .map((company) => ({
        ...company,
        percentage:
          company.total > 0
            ? Math.round((company.offers / company.total) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total); // Sort by total submissions

    return NextResponse.json({ data: companies });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch company statistics" },
      { status: 500 }
    );
  }
}
