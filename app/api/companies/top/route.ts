import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type CompanyStats = {
  name: string;
  total: number;
  offers: number;
  percentage: number;
  logoUrl?: string | null;
};

export async function GET(request: NextRequest) {
  try {
    // First, get the most recent year from submissions
    const { data: yearData, error: yearError } = await supabase
      .from("submissions")
      .select("year")
      .eq("status", "accepted")
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (yearError || !yearData) {
      return NextResponse.json({
        data: {
          mostSubmissions: [],
          bestRates: [],
          worstRates: [],
        },
        year: new Date().getFullYear(),
      });
    }

    const mostRecentYear = yearData.year;

    // Get all accepted submissions for the most recent year
    const { data: submissions, error } = await supabase
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
      .eq("year", mostRecentYear);

    if (error) throw error;

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        data: {
          mostSubmissions: [],
          bestRates: [],
          worstRates: [],
        },
        year: mostRecentYear,
      });
    }

    // Calculate company statistics
    const companyStats = new Map<string, CompanyStats>();
    const companyDomains = new Map<string, string>();

    submissions.forEach((submission) => {
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

    // Fetch company domains for all companies
    const uniqueCompanyNames = Array.from(companyStats.keys());
    for (const companyName of uniqueCompanyNames) {
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
            companyDomains.set(companyName, match.domain);
          }
        }
      } catch (err) {
        // Silently fail if Clearbit lookup fails
      }
    }

    // Calculate percentages and convert to array
    const companies = Array.from(companyStats.values())
      .map((company) => {
        const domain = companyDomains.get(company.name);
        return {
          ...company,
          percentage:
            company.total > 0
              ? Math.round((company.offers / company.total) * 100)
              : 0,
          logoUrl: domain
            ? `/api/logo?domain=${encodeURIComponent(domain)}`
            : null,
        };
      })
      .filter((company) => company.total > 0); // Only include companies with submissions

    // Sort by different criteria
    const mostSubmissions = [...companies].sort((a, b) => b.total - a.total);
    const bestRates = [...companies]
      .filter((c) => c.total >= 3) // Only include companies with at least 3 submissions for rate rankings
      .sort((a, b) => {
        if (b.percentage !== a.percentage) {
          return b.percentage - a.percentage;
        }
        return b.total - a.total; // Tie-breaker: more submissions
      });
    const worstRates = [...companies]
      .filter((c) => c.total >= 3) // Only include companies with at least 3 submissions for rate rankings
      .sort((a, b) => {
        if (a.percentage !== b.percentage) {
          return a.percentage - b.percentage;
        }
        return b.total - a.total; // Tie-breaker: more submissions
      });

    return NextResponse.json({
      data: {
        mostSubmissions,
        bestRates,
        worstRates,
      },
      year: mostRecentYear,
    });
  } catch (error) {
    console.error("Error fetching top companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch top companies" },
      { status: 500 }
    );
  }
}
