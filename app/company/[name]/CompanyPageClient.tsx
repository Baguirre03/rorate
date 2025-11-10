"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/supabase";
import { useAnalytics } from "@/hooks/useAnalytics";
import SubmitCTA from "@/components/SubmitCTA";
import { StructuredData } from "@/components/StructuredData";
import { SITE_URL } from "@/lib/constants";
import Loader from "@/components/Loader";
import CompanyError from "@/components/CompanyPage/CompanyError";
import CompanyHeader from "@/components/CompanyPage/CompanyHeader";
import Filters from "@/components/CompanyPage/Filters";
import NoData from "@/components/CompanyPage/NoData";
import StatsDisplay from "@/components/CompanyPage/StatsDisplay";
import YearBreakdown from "@/components/CompanyPage/YearBreakdown";
import SubmissionsList from "@/components/CompanyPage/SubmissionsList";

type SubmissionWithCompany = Tables<"submissions"> & {
  companies: Pick<Tables<"companies">, "id" | "name"> | null;
};

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

  const companySchema = data?.company
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${companyName} Return Offer Rate`,
        description: `${companyName} return offer rate statistics and data. ${data.stats.total} submissions, ${data.stats.percentage}% return offer rate.`,
        url: `${SITE_URL}/company/${encodeURIComponent(companyName)}`,
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
              item: SITE_URL,
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
    return <Loader />;
  }

  if (error) {
    return <CompanyError />;
  }

  const { company, stats, byYear, submissions } = data || {
    company: { name: companyName, id: 0 },
    stats: { total: 0, offers: 0, percentage: 0 },
    byYear: [],
    submissions: [],
  };

  const hasNoData = !data || stats.total === 0;

  const availableTerms = Array.from(
    new Set(submissions.map((s) => s.term))
  ).sort();

  const availableYears = Array.from(
    new Set(submissions.map((s) => s.year))
  ).sort((a, b) => b - a);

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
      if (s.position_type !== selectedPositionType) {
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
          <CompanyHeader
            companyName={companyName}
            company={company}
            subtitle="Return Offer Statistics"
          />

          {submissions.length > 0 && (
            <Filters
              selectedYear={selectedYear}
              selectedInternType={selectedInternType}
              selectedTerm={selectedTerm}
              selectedPositionType={selectedPositionType}
              onYearChange={handleYearChange}
              onInternTypeChange={setSelectedInternType}
              onTermChange={setSelectedTerm}
              onPositionTypeChange={handlePositionTypeChange}
              availableYears={availableYears}
              availableTerms={availableTerms}
              internTypes={INTERN_TYPES}
              companyName={companyName}
              onTrackClick={trackClick}
            />
          )}
          {hasNoData && (
            <NoData
              title="Nothing there yet"
              description={`No submission data available for ${
                company?.name || companyName
              } ${
                selectedInternType !== "all" && selectedTerm !== "all"
                  ? `for ${selectedInternType} in ${selectedTerm}`
                  : selectedInternType !== "all"
                  ? `for ${selectedInternType}`
                  : selectedTerm !== "all"
                  ? `for ${selectedTerm}`
                  : ""
              } at this time.`}
            />
          )}
          {!hasNoData && filteredStats.total === 0 && hasActiveFilters && (
            <NoData
              title="No Data Available"
              description={`No submission data available for ${
                company?.name || companyName
              } ${
                selectedInternType !== "all" && selectedTerm !== "all"
                  ? `for ${selectedInternType} in ${selectedTerm}`
                  : selectedInternType !== "all"
                  ? `for ${selectedInternType}`
                  : selectedTerm !== "all"
                  ? `for ${selectedTerm}`
                  : ""
              } with the current filters.`}
            />
          )}
          {!hasNoData && filteredStats.total > 0 && (
            <StatsDisplay
              title={
                selectedYear === "all"
                  ? "Overall Statistics"
                  : `${selectedYear} Statistics`
              }
              description={
                selectedYear === "all"
                  ? "Return offer rate across all submissions"
                  : `Return offer rate for ${selectedYear}`
              }
              stats={[
                {
                  value: `${filteredStats.percentage}%`,
                  label: "Return Offer Rate",
                },
                {
                  value: filteredStats.offers,
                  label: "Offers Extended",
                },
                {
                  value: filteredStats.total,
                  label: "Total Submissions",
                },
              ]}
              percentage={filteredStats.percentage}
            />
          )}
          {byYear.length > 0 && filteredStats.total > 0 && (
            <YearBreakdown years={byYear} />
          )}
          {filteredSubmissions.length > 0 && (
            <SubmissionsList
              title="Submissions"
              description={`${
                selectedYear === "all"
                  ? `Recent submissions for ${company?.name}`
                  : `${selectedYear} submissions for ${company?.name}`
              }${hasActiveFilters ? " (filtered)" : ""}`}
              submissions={filteredSubmissions}
              limit={10}
            />
          )}
          <SubmitCTA />
        </div>
      </div>
    </>
  );
}
