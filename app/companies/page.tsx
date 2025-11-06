"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTopCompanies } from "@/hooks/useTopCompanies";
import { useAnalytics } from "@/hooks/useAnalytics";
import SubmitCTA from "@/components/SubmitCTA";
import { useEffect } from "react";

type CompanyStats = {
  name: string;
  total: number;
  offers: number;
  percentage: number;
  logoUrl?: string | null;
};

function CompanyCard({
  company,
  rank,
}: {
  company: CompanyStats;
  rank: number;
}) {
  const { trackClick } = useAnalytics();

  return (
    <Link
      href={`/company/${encodeURIComponent(company.name)}`}
      className="block last:mb-0 cursor-pointer"
      onClick={() =>
        trackClick("click_company_card", { company: company.name, rank })
      }
    >
      <div className="border-b border-border/50 hover:bg-accent/30 transition-all duration-200 cursor-pointer group">
        <div className="py-4 sm:py-5">
          {/* Desktop Grid Layout - Matches Header */}
          <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 items-center">
            {/* Rank Number */}
            <div className="text-center">
              <span className="text-sm sm:text-base font-medium text-muted-foreground">
                {rank}
              </span>
            </div>

            {/* Company Logo */}
            <div>
              {company.logoUrl ? (
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-muted border border-border/50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Company Name */}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                {company.name}
              </h3>
            </div>

            {/* Submissions */}
            <div className="text-right">
              <div className="text-base font-semibold text-foreground">
                {company.total}
              </div>
            </div>

            {/* Offers */}
            <div className="text-right">
              <div className="text-base font-semibold text-foreground">
                {company.offers}
              </div>
            </div>

            {/* RO Rate */}
            <div className="text-right">
              <div className="text-base font-semibold text-foreground">
                {company.percentage}%
              </div>
            </div>

            {/* Arrow */}
            <div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden px-4">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              {/* Rank Number */}
              <div className="shrink-0 w-8 text-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {rank}
                </span>
              </div>

              {/* Company Logo */}
              <div className="shrink-0">
                {company.logoUrl ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
                    <Image
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md bg-muted border border-border/50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Company Name */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-foreground truncate mb-1">
                  {company.name}
                </h3>
              </div>
            </div>

            {/* Stats - Mobile Layout */}
            <div className="flex items-center gap-4">
              <div className="text-right flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Submissions
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {company.total}
                </div>
              </div>
              <div className="text-right flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Offers
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {company.offers}
                </div>
              </div>
              <div className="text-right flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">
                  RO Rate
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {company.percentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TabContent({
  companies,
  emptyMessage,
  icon: Icon,
}: {
  companies: CompanyStats[];
  emptyMessage: string;
  icon: React.ElementType;
}) {
  if (companies.length === 0) {
    return (
      <div className="py-12 sm:py-16 text-center">
        <Icon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          No Data Available
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
      {/* Table Header - Desktop Only */}
      <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-muted/30 border-b border-border/50">
        <div></div>
        <div></div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Company
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
          Submissions
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
          Offers
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
          RO Rate
        </div>
        <div></div>
      </div>
      {companies.map((company, index) => (
        <CompanyCard
          key={`${company.name}-${index}`}
          company={company}
          rank={index + 1}
        />
      ))}
    </div>
  );
}

export default function TopCompaniesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("most-submissions");
  const { data, isLoading, error } = useTopCompanies();
  const { trackClick, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("top_companies", { tab: activeTab });
  }, [trackPageView, activeTab]);

  const { data: companiesData, year } = data || {
    data: {
      mostSubmissions: [],
      bestRates: [],
      worstRates: [],
    },
    year: new Date().getFullYear(),
  };

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      trackClick("click_tab", { tab: value, page: "top_companies" });
    },
    [trackClick]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
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
      <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              trackClick("click_back_button", { page: "top_companies" });
              router.push("/");
            }}
            className="mb-4 sm:mb-6 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="py-12 sm:py-16 text-center">
            <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Error</h2>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Failed to load top companies data. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-2">
              Top Companies
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Rankings based on {year} return offer data
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger
              value="most-submissions"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Most Submissions</span>
              <span className="sm:hidden">Submissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="best-rates"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Best RO Rates</span>
              <span className="sm:hidden">Best Rates</span>
            </TabsTrigger>
            <TabsTrigger
              value="worst-rates"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Worst RO Rates</span>
              <span className="sm:hidden">Worst Rates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="most-submissions" className="mt-6 sm:mt-8">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Companies ranked by total number of submissions in {year}
              </p>
            </div>
            <TabContent
              companies={companiesData.mostSubmissions}
              emptyMessage="No submission data available for this category."
              icon={BarChart3}
            />
          </TabsContent>

          <TabsContent value="best-rates" className="mt-6 sm:mt-8">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Companies with the highest return offer rates in {year} (minimum
                3 submissions required)
              </p>
            </div>
            <TabContent
              companies={companiesData.bestRates}
              emptyMessage="No companies meet the minimum submission threshold for rate rankings."
              icon={TrendingUp}
            />
          </TabsContent>

          <TabsContent value="worst-rates" className="mt-6 sm:mt-8">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Companies with the lowest return offer rates in {year} (minimum
                3 submissions required)
              </p>
            </div>
            <TabContent
              companies={companiesData.worstRates}
              emptyMessage="No companies meet the minimum submission threshold for rate rankings."
              icon={TrendingDown}
            />
          </TabsContent>
        </Tabs>

        {/* Submit CTA */}
        <SubmitCTA />
      </div>
    </div>
  );
}
