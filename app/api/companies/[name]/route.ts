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
    const searchParams = request.nextUrl.searchParams;
    const internType = searchParams.get("internType");
    const term = searchParams.get("term");
    const year = searchParams.get("year");

    // Get all accepted submissions for this company
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
      .eq("companies.name", companyName);

    // Apply filters if provided
    if (internType) {
      query = query.eq("intern_type", internType);
    }
    if (term) {
      query = query.eq("term", term);
    }
    if (year) {
      query = query.eq("year", parseInt(year));
    }

    const { data: submissions, error } = await query
      .order("year", { ascending: false })
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    // Try to get company domain from Clearbit
    let companyDomain: string | null = null;
    try {
      const clearbitResponse = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
          companyName
        )}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; CompanySearch/1.0)",
          },
        }
      );
      if (clearbitResponse.ok) {
        const suggestions = await clearbitResponse.json();
        const match = suggestions.find(
          (s: { name: string }) =>
            s.name.toLowerCase() === companyName.toLowerCase()
        );
        if (match && match.domain) {
          companyDomain = match.domain;
        }
      }
    } catch (err) {
      // Silently fail if Clearbit lookup fails
      console.error("Failed to fetch company domain:", err);
    }

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
      company: {
        ...submissions[0].companies,
        domain: companyDomain,
        logoUrl: companyDomain
          ? `/api/logo?domain=${encodeURIComponent(companyDomain)}`
          : null,
      },
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
