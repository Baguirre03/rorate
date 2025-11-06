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
  Trophy,
  Medal,
  Award,
  Users,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  showRank = true,
}: {
  company: CompanyStats;
  rank: number;
  showRank?: boolean;
}) {
  const { trackClick } = useAnalytics();
  const getRankDisplay = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30">
          <Trophy className="h-6 w-6 text-yellow-500" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-400/10 border-2 border-gray-400/30">
          <Medal className="h-6 w-6 text-gray-400" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-600/10 border-2 border-amber-600/30">
          <Award className="h-6 w-6 text-amber-600" />
        </div>
      );
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted border border-border">
        <span className="text-lg font-semibold text-foreground">{rank}</span>
      </div>
    );
  };

  return (
    <Link
      href={`/company/${encodeURIComponent(company.name)}`}
      className="block mb-6 last:mb-0 cursor-pointer"
      onClick={() =>
        trackClick("click_company_card", { company: company.name, rank })
      }
    >
      <Card className="border shadow-sm hover:bg-accent/50 transition-colors duration-150 cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Rank */}
            {showRank && <div className="shrink-0">{getRankDisplay(rank)}</div>}

            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                {company.logoUrl ? (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                    <Image
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <h3 className="text-2xl font-semibold tracking-tight text-foreground truncate">
                  {company.name}
                </h3>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Submissions
                    </span>
                  </div>
                  <span className="text-2xl font-semibold text-foreground">
                    {company.total}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Offers
                    </span>
                  </div>
                  <span className="text-2xl font-semibold text-foreground">
                    {company.offers}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      RO Rate
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-foreground">
                      {company.percentage}%
                    </span>
                    <Badge
                      variant={
                        company.percentage >= 70
                          ? "success"
                          : company.percentage >= 50
                          ? "warning"
                          : "secondary"
                      }
                      className="text-xs font-medium"
                    >
                      {company.percentage >= 70
                        ? "Excellent"
                        : company.percentage >= 50
                        ? "Good"
                        : "Low"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    company.percentage >= 70
                      ? "bg-green-500"
                      : company.percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-foreground"
                  }`}
                  style={{ width: `${company.percentage}%` }}
                />
              </div>
            </div>

            {/* Arrow */}
            <div className="shrink-0">
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-150" />
            </div>
          </div>
        </CardContent>
      </Card>
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
      <Card className="border shadow-sm">
        <CardContent className="py-16 text-center">
          <Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {companies.map((company, index) => (
        <CompanyCard
          key={company.name}
          company={company}
          rank={index + 1}
          showRank={true}
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

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      trackClick("click_tab", { tab: value, page: "top_companies" });
    },
    [trackClick]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-6">
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
      <div className="min-h-screen bg-background py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              trackClick("click_back_button", { page: "top_companies" });
              router.push("/");
            }}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Card className="border shadow-sm">
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground">
                Failed to load top companies data. Please try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { data: companiesData, year } = data || {
    data: {
      mostSubmissions: [],
      bestRates: [],
      worstRates: [],
    },
    year: new Date().getFullYear(),
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted border border-border">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-2">
                Top Companies
              </h1>
              <p className="text-base text-muted-foreground">
                Rankings based on {year} return offer data
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger
              value="most-submissions"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Most Submissions</span>
              <span className="sm:hidden">Submissions</span>
            </TabsTrigger>
            <TabsTrigger value="best-rates" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Best RO Rates</span>
              <span className="sm:hidden">Best Rates</span>
            </TabsTrigger>
            <TabsTrigger
              value="worst-rates"
              className="flex items-center gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Worst RO Rates</span>
              <span className="sm:hidden">Worst Rates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="most-submissions" className="mt-6">
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

          <TabsContent value="best-rates" className="mt-6">
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

          <TabsContent value="worst-rates" className="mt-6">
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
