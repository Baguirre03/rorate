import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type YearStats = {
  year: number;
  total: number;
  offers: number;
  percentage: number;
};

type YearData = {
  year: number;
  total: number;
  offers: number;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> | { name: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const companyName = decodeURIComponent(resolvedParams.name);

    // Get all accepted submissions for this company
    const { data: submissions, error } = await supabase
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
      .eq("companies.name", companyName)
      .order("year", { ascending: false })
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        company: null,
        stats: {
          total: 0,
          offers: 0,
          percentage: 0,
        },
        byYear: [],
        submissions: [],
      });
    }

    // Calculate statistics
    const total = submissions.length;
    const offers = submissions.filter(
      (s) => s.return_offer_extended === true
    ).length;
    const percentage = total > 0 ? Math.round((offers / total) * 100) : 0;

    // Group by year
    const byYear = submissions.reduce((acc, submission) => {
      const year = submission.year;
      if (!acc[year]) {
        acc[year] = {
          year,
          total: 0,
          offers: 0,
        };
      }
      acc[year].total++;
      if (submission.return_offer_extended === true) {
        acc[year].offers++;
      }
      return acc;
    }, {} as Record<number, YearData>);

    const yearStats: YearStats[] = (Object.values(byYear) as YearData[]).map(
      (yearData) => ({
        year: yearData.year,
        total: yearData.total,
        offers: yearData.offers,
        percentage:
          yearData.total > 0
            ? Math.round((yearData.offers / yearData.total) * 100)
            : 0,
      })
    );

    return NextResponse.json({
      company: submissions[0].companies,
      stats: {
        total,
        offers,
        percentage,
      },
      byYear: yearStats.sort((a, b) => b.year - a.year),
      submissions,
    });
  } catch (error) {
    console.error("Error fetching company data:", error);
    return NextResponse.json(
      { error: "Failed to fetch company data" },
      { status: 500 }
    );
  }
}
