"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/types/supabase";
import { useAnalytics } from "@/hooks/useAnalytics";
import SubmitCTA from "@/components/SubmitCTA";
import { useEffect } from "react";

type SubmissionWithCompany = Tables<"submissions"> & {
  companies: Pick<Tables<"companies">, "id" | "name"> | null;
};

type CompanyData = {
  company: Pick<Tables<"companies">, "id" | "name"> | null;
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

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const companyName = decodeURIComponent(params.name as string);
  const { trackClick, trackPageView } = useAnalytics();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
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
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground">
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

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            trackClick("click_back_button", {
              page: "company_detail",
              company: companyName,
            });
            router.push("/");
          }}
          className="mb-8 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Company Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
              {company?.name || companyName}
            </h1>
          </div>
          <p className="text-base text-muted-foreground ml-14">
            Return Offer Statistics
          </p>
        </div>

        {/* No Data Message */}
        {hasNoData && (
          <Card className="mb-8">
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Nothing there yet</h2>
              <p className="text-muted-foreground">
                No submission data available for {company?.name || companyName}{" "}
                at this time.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Overall Stats */}
        {!hasNoData && (
          <Card className="mb-8 border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Overall Statistics
              </CardTitle>
              <CardDescription className="text-sm">
                Return offer rate across all submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-5xl font-semibold mb-2 tracking-tight text-foreground">
                    {stats.percentage}%
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Return Offer Rate
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-semibold mb-2 tracking-tight text-foreground">
                    {stats.offers}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Offers Extended
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-semibold mb-2 tracking-tight text-foreground">
                    {stats.total}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Total Submissions
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-foreground h-2.5 rounded-full transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Year Breakdown */}
        {byYear.length > 0 && (
          <Card className="mb-8 border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl font-semibold">
                  Year Breakdown
                </CardTitle>
              </div>
              <CardDescription className="text-sm">
                Return offer rates by year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {byYear.map((yearData) => (
                  <div
                    key={yearData.year}
                    className="border-b border-border last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-semibold tracking-tight text-foreground">
                          {yearData.year}
                        </span>
                        <Badge variant="secondary" className="font-medium">
                          {yearData.total} submission
                          {yearData.total !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-semibold tracking-tight text-foreground">
                          {yearData.percentage}%
                        </div>
                        <div className="text-xs font-medium text-muted-foreground mt-1">
                          {yearData.offers} of {yearData.total}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className="bg-foreground h-2 rounded-full transition-all"
                        style={{ width: `${yearData.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl font-semibold">
                  Submissions
                </CardTitle>
              </div>
              <CardDescription className="text-sm">
                Recent submissions for {company?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submissions.slice(0, 10).map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge
                            variant={
                              submission.return_offer_extended
                                ? "success"
                                : "secondary"
                            }
                            className="font-medium"
                          >
                            {submission.return_offer_extended
                              ? "Offer Extended"
                              : "No Offer"}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground">
                            {submission.year} • {submission.term}
                          </span>
                          {submission.intern_type && (
                            <span className="text-sm font-medium text-muted-foreground">
                              • {submission.intern_type}
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
                {submissions.length > 10 && (
                  <div className="text-center text-sm font-medium text-muted-foreground pt-4">
                    Showing 10 of {submissions.length} submissions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit CTA */}
        <SubmitCTA />
      </div>
    </div>
  );
}
