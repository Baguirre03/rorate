"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  TrendingUp,
  Calendar,
  Loader2,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/types/supabase";
import { useAnalytics } from "@/hooks/useAnalytics";
import SubmitCTA from "@/components/SubmitCTA";
import { StructuredData } from "@/components/StructuredData";

type SubmissionWithCompany = Tables<"submissions"> & {
  companies: Pick<Tables<"companies">, "id" | "name"> | null;
};

type CompanyData = {
  company:
    | (Pick<Tables<"companies">, "id" | "name"> & {
        domain?: string | null;
        logoUrl?: string | null;
      })
    | null;
  stats: {
    total: number;
    offers: number;
    percentage: number;
  };
  byYear: {
    year: number;
    total: number;
    offers: number;
    percentage: number;
  }[];
  submissions: SubmissionWithCompany[];
};

export default function CompanyPageClient({
  companyName,
}: {
  companyName: string;
}) {
  const router = useRouter();
  const { trackClick, trackPageView } = useAnalytics();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedInternType, setSelectedInternType] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedPositionType, setSelectedPositionType] =
    useState<string>("all");

  const handleYearChange = useCallback(
    (value: string) => {
      setSelectedYear(value);
      trackClick("click_year_filter", {
        company: companyName,
        year: value,
      });
    },
    [trackClick, companyName]
  );

  const handlePositionTypeChange = useCallback(
    (value: string) => {
      setSelectedPositionType(value);
      trackClick("click_position_type_filter", {
        company: companyName,
        positionType: value,
      });
    },
    [trackClick, companyName]
  );

  useEffect(() => {
    trackPageView("company_detail", { company: companyName });
  }, [trackPageView, companyName]);

  const { data, isLoading, error } = useQuery<CompanyData>({
    queryKey: ["company", companyName],
    queryFn: async () => {
      const response = await fetch(
        `/api/companies/${encodeURIComponent(companyName)}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch company data");
      }
      return response.json();
    },
  });

  // Generate structured data for the company page
  const companySchema = data?.company
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${companyName} Return Offer Rate`,
        description: `${companyName} return offer rate statistics and data. ${data.stats.total} submissions, ${data.stats.percentage}% return offer rate.`,
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://rorates.fyi"
        }/company/${encodeURIComponent(companyName)}`,
        mainEntity: {
          "@type": "Organization",
          name: companyName,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: process.env.NEXT_PUBLIC_SITE_URL || "https://rorates.fyi",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: companyName,
            },
          ],
        },
      }
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-6 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-6 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Card>
            <CardContent className="py-12 sm:py-16 text-center px-4">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Error</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Failed to load company data. Please try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { company, stats, byYear, submissions } = data || {
    company: { name: companyName, id: 0 },
    stats: { total: 0, offers: 0, percentage: 0 },
    byYear: [],
    submissions: [],
  };

  const hasNoData = !data || stats.total === 0;

  // Always show all intern types, even if no data
  const INTERN_TYPES = [
    "Software Engineering",
    "Machine Learning Engineer",
    "Product Management",
    "Data Science",
    "Design",
    "Marketing",
    "Finance",
    "Other",
  ];

  // Get available terms from submissions
  const availableTerms = Array.from(
    new Set(submissions.map((s) => s.term))
  ).sort();

  const availableYears = Array.from(
    new Set(submissions.map((s) => s.year))
  ).sort((a, b) => b - a);

  // Filter submissions and stats by selected filters
  const filteredSubmissions = submissions.filter((s) => {
    if (selectedYear !== "all" && s.year !== parseInt(selectedYear)) {
      return false;
    }
    if (selectedInternType !== "all" && s.intern_type !== selectedInternType) {
      return false;
    }
    if (selectedTerm !== "all" && s.term !== selectedTerm) {
      return false;
    }
    if (selectedPositionType !== "all") {
      // Only filter by position type for return offers
      if (s.return_offer_extended === true) {
        if (s.position_type !== selectedPositionType) {
          return false;
        }
      } else {
        // If filtering for a specific position type but no return offer, exclude it
        return false;
      }
    }
    return true;
  });

  // Calculate filtered stats
  const filteredStats = (() => {
    if (filteredSubmissions.length === 0) {
      return { total: 0, offers: 0, percentage: 0 };
    }
    const total = filteredSubmissions.length;
    const offers = filteredSubmissions.filter(
      (s) => s.return_offer_extended === true
    ).length;
    const percentage = total > 0 ? Math.round((offers / total) * 100) : 0;
    return { total, offers, percentage };
  })();

  const hasActiveFilters =
    selectedYear !== "all" ||
    selectedInternType !== "all" ||
    selectedTerm !== "all" ||
    selectedPositionType !== "all";

  return (
    <>
      {companySchema && <StructuredData data={companySchema} />}
      <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Company Header */}
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              {company?.logoUrl ? (
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground truncate">
                  {company?.name || companyName}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Return Offer Statistics
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          {submissions.length > 0 && (
            <div className="mb-6 sm:mb-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide">
                  Filter Data
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {/* Year Filter */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                    Year
                  </label>
                  <Tabs value={selectedYear} onValueChange={handleYearChange}>
                    <TabsList className="w-full grid grid-cols-4 h-auto p-1">
                      <TabsTrigger value="all" className="text-xs py-1.5">
                        All
                      </TabsTrigger>
                      {availableYears.slice(0, 3).map((year) => (
                        <TabsTrigger
                          key={year}
                          value={year.toString()}
                          className="text-xs py-1.5"
                        >
                          {year}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Intern Type Filter */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                    Intern Type
                  </label>
                  <select
                    value={selectedInternType}
                    onChange={(e) => {
                      setSelectedInternType(e.target.value);
                      trackClick("click_intern_type_filter", {
                        company: companyName,
                        internType: e.target.value,
                      });
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    {INTERN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Filter */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                    Term
                  </label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => {
                      setSelectedTerm(e.target.value);
                      trackClick("click_term_filter", {
                        company: companyName,
                        term: e.target.value,
                      });
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <option value="all">All Terms</option>
                    {availableTerms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position Type Filter */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                    Return Offer Type
                  </label>
                  <Tabs
                    value={selectedPositionType}
                    onValueChange={handlePositionTypeChange}
                  >
                    <TabsList className="w-full grid grid-cols-3 h-auto p-1">
                      <TabsTrigger value="all" className="text-xs py-1.5">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="Full Time" className="text-xs py-1.5">
                        Full Time
                      </TabsTrigger>
                      <TabsTrigger value="Intern" className="text-xs py-1.5">
                        Intern
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {hasNoData && (
            <div className="mb-6 sm:mb-12 py-12 sm:py-16 text-center px-4">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                Nothing there yet
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                No submission data available for {company?.name || companyName}{" "}
                {selectedInternType !== "all" && selectedTerm !== "all"
                  ? `for ${selectedInternType} in ${selectedTerm}`
                  : selectedInternType !== "all"
                  ? `for ${selectedInternType}`
                  : selectedTerm !== "all"
                  ? `for ${selectedTerm}`
                  : ""}{" "}
                at this time.
              </p>
            </div>
          )}

          {/* No Data for Selected Filters */}
          {!hasNoData && filteredStats.total === 0 && hasActiveFilters && (
            <div className="mb-6 sm:mb-12 py-12 sm:py-16 text-center px-4">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                No Data Available
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                No submission data available for {company?.name || companyName}{" "}
                {selectedInternType !== "all" && selectedTerm !== "all"
                  ? `for ${selectedInternType} in ${selectedTerm}`
                  : selectedInternType !== "all"
                  ? `for ${selectedInternType}`
                  : selectedTerm !== "all"
                  ? `for ${selectedTerm}`
                  : ""}{" "}
                with the current filters.
              </p>
            </div>
          )}

          {/* Overall Stats */}
          {!hasNoData && filteredStats.total > 0 && (
            <div className="mb-6 sm:mb-12 pb-6 sm:pb-12 border-b border-border/50">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  {selectedYear === "all"
                    ? "Overall Statistics"
                    : `${selectedYear} Statistics`}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedYear === "all"
                    ? "Return offer rate across all submissions"
                    : `Return offer rate for ${selectedYear}`}
                </p>
              </div>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
                  <div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-foreground">
                      {filteredStats.percentage}%
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Return Offer Rate
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-foreground">
                      {filteredStats.offers}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Offers Extended
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-foreground">
                      {filteredStats.total}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Total Submissions
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-green-500 dark:bg-green-400"
                      style={{ width: `${filteredStats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Year Breakdown */}
          {byYear.length > 0 && filteredStats.total > 0 && (
            <div className="mb-6 sm:mb-12 pb-6 sm:pb-12 border-b border-border/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Year Breakdown
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                Return offer rates by year
              </p>
              <div>
                <div className="space-y-4 sm:space-y-6">
                  {byYear.map((yearData) => (
                    <div
                      key={yearData.year}
                      className="border-b border-border last:border-0 pb-4 sm:pb-6 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          <span className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                            {yearData.year}
                          </span>
                          <Badge
                            variant="secondary"
                            className="font-medium text-xs"
                          >
                            {yearData.total} submission
                            {yearData.total !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            {yearData.percentage}%
                          </div>
                          <div className="text-xs font-medium text-muted-foreground mt-1">
                            {yearData.offers} of {yearData.total}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-green-500 dark:bg-green-400"
                          style={{ width: `${yearData.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Submissions */}
          {filteredSubmissions.length > 0 && (
            <div className="mb-6 sm:mb-12 pb-6 sm:pb-12 border-b border-border/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Submissions
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                {selectedYear === "all"
                  ? `Recent submissions for ${company?.name}`
                  : `${selectedYear} submissions for ${company?.name}`}
                {hasActiveFilters && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (filtered)
                  </span>
                )}
              </p>
              <div>
                <div className="space-y-2 sm:space-y-3">
                  {filteredSubmissions.slice(0, 10).map((submission) => (
                    <div
                      key={submission.id}
                      className="border border-border rounded-lg p-3 sm:p-4 hover:bg-accent/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                            <Badge
                              variant={
                                submission.return_offer_extended
                                  ? "success"
                                  : "secondary"
                              }
                              className="font-medium text-xs"
                            >
                              {submission.return_offer_extended
                                ? "Offer Extended"
                                : "No Offer"}
                            </Badge>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                              {submission.year} • {submission.term}
                            </span>
                            {submission.intern_type && (
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                • {submission.intern_type}
                              </span>
                            )}
                            {submission.return_offer_extended &&
                              submission.position_type && (
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                  • {submission.position_type}
                                </span>
                              )}
                          </div>
                          {submission.submitted_at && (
                            <div className="text-xs text-muted-foreground">
                              Submitted:{" "}
                              {new Date(
                                submission.submitted_at
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSubmissions.length > 10 && (
                    <div className="text-center text-xs sm:text-sm font-medium text-muted-foreground pt-2 sm:pt-4">
                      Showing 10 of {filteredSubmissions.length} submissions
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <SubmitCTA />
        </div>
      </div>
    </>
  );
}
