import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    let query = supabase
      .from("public_accepted_submissions")
      .select("return_offer_extended, company_name, company_id")
      .eq("year", 2025);

    if (search) {
      query = query.ilike("company_name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    const companyStats = new Map<
      string,
      { name: string; total: number; offers: number; percentage: number }
    >();

    data.forEach((submission) => {
      // company_name is now a direct field in the view
      const companyName = submission.company_name;
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

    const companies = Array.from(companyStats.values())
      .map((company) => ({
        ...company,
        percentage:
          company.total > 0
            ? Math.round((company.offers / company.total) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ data: companies });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch company statistics" },
      { status: 500 }
    );
  }
}
