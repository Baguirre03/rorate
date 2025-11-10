import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

type CompanyStats = {
  name: string;
  total: number;
  offers: number;
  percentage: number;
  logoUrl?: string | null;
};

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get("sort") || "most-submissions";
    const limit = parseInt(searchParams.get("limit") || "15");
    const offset = parseInt(searchParams.get("offset") || "0");
    const { data: yearData, error: yearError } = await supabase
      .from("public_accepted_submissions")
      .select("year")
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (yearError || !yearData) {
      return NextResponse.json({
        data: [],
        total: 0,
        year: new Date().getFullYear(),
      });
    }

    const mostRecentYear = yearData.year;

    const { data: submissions, error } = await supabase
      .from("public_accepted_submissions")
      .select("return_offer_extended, company_name, company_id")
      .eq("year", mostRecentYear);

    if (error) throw error;

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        hasMore: false,
        year: mostRecentYear,
      });
    }

    const companyStats = new Map<string, CompanyStats>();

    submissions.forEach((submission) => {
      // company_name is now a direct field in the view (no nested structure)
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

    const companyDomains = new Map<string, string>();

    const companies = Array.from(companyStats.values())
      .map((company) => {
        return {
          ...company,
          percentage:
            company.total > 0
              ? Math.round((company.offers / company.total) * 100)
              : 0,
        };
      })
      .filter((company) => company.total > 0);

    let sortedCompanies: CompanyStats[];

    switch (sort) {
      case "best-rates":
        sortedCompanies = [...companies]
          .filter((c) => c.total >= 3)
          .sort((a, b) => {
            if (b.percentage !== a.percentage) {
              return b.percentage - a.percentage;
            }
            return b.total - a.total;
          });
        break;
      case "worst-rates":
        sortedCompanies = [...companies]
          .filter((c) => c.total >= 3)
          .sort((a, b) => {
            if (a.percentage !== b.percentage) {
              return a.percentage - b.percentage;
            }
            return b.total - a.total;
          });
        break;
      case "most-submissions":
      default:
        sortedCompanies = [...companies].sort((a, b) => b.total - a.total);
        break;
    }

    const total = sortedCompanies.length;
    const paginatedCompanies = sortedCompanies.slice(offset, offset + limit);

    const paginatedCompanyNames = paginatedCompanies.map((c) => c.name);
    for (const companyName of paginatedCompanyNames) {
      if (!companyDomains.has(companyName)) {
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
        } catch {}
      }
    }

    const companiesWithLogos = paginatedCompanies.map((company) => {
      const domain = companyDomains.get(company.name);
      return {
        ...company,
        logoUrl: domain
          ? `/api/logo?domain=${encodeURIComponent(domain)}`
          : null,
      };
    });

    return NextResponse.json({
      data: companiesWithLogos,
      total,
      hasMore: offset + limit < total,
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
