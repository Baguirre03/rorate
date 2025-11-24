"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import SubmitCTA from "@/components/SubmitCTA";
import { useEffect } from "react";

type SubmissionWithCompany = {
  id: number;
  company_id: number;
  year: number;
  term: string;
  intern_type: string | null;
  position_type: string | null;
  linkedin_url: string | null;
  return_offer_extended: boolean;
  status: string;
  submitted_at: string | null;
  companies: {
    id: number;
    name: string;
  };
};

type AnalyticsData = {
  total: number;
  bySource: Array<{ source: string; count: number }>;
  bySchool: Array<{ school_name: string; count: number }>;
  bySourceAndSchool: Array<{
    source: string;
    school_name: string;
    count: number;
  }>;
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "accepted":
      return "success";
    case "declined":
      return "destructive";
    case "waiting":
      return "warning";
    default:
      return "secondary";
  }
};

export default function SubmissionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { trackClick, trackPageView } = useAnalytics();
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    trackPageView("submissions");
  }, [trackPageView]);

  const { data, isLoading, error } = useQuery<{
    data: SubmissionWithCompany[];
  }>({
    queryKey: ["submissions", "all"],
    queryFn: async () => {
      const response = await fetch("/api/submissions?all=true", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      return response.json();
    },
  });

  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useQuery<{
    data: SubmissionWithCompany[];
    analytics?: AnalyticsData;
  }>({
    queryKey: ["submissions", "analytics"],
    queryFn: async () => {
      const response = await fetch("/api/submissions?analytics=true&all=true", {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch analytics");
      }
      return response.json();
    },
    enabled: showAnalytics, // Only fetch when analytics is shown
    retry: false, // Don't retry on auth errors
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "accepted" | "declined";
    }) => {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update submission");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Submission updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update submission", {
        description: error.message,
      });
    },
  });

  const handleAccept = useCallback(
    (id: number) => {
      updateStatusMutation.mutate({ id, status: "accepted" });
    },
    [updateStatusMutation]
  );

  const handleDecline = useCallback(
    (id: number) => {
      updateStatusMutation.mutate({ id, status: "declined" });
    },
    [updateStatusMutation]
  );

  if (isLoading) {
    return (
      <div className="bg-background py-6 sm:py-12 px-4">
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
      <div className="bg-background py-6 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-lg sm:text-xl">Error</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Failed to load contributions. Please try again.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const submissions = data?.data || [];

  return (
    <div className="bg-background py-4 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => {
              trackClick("click_back_button", { page: "submissions" });
              router.push("/");
            }}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Card>
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Contributions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Review and manage all contributions ({submissions.length}{" "}
                  total)
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAnalytics(!showAnalytics);
                  trackClick("view_analytics", { page: "submissions" });
                }}
                className="shrink-0"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showAnalytics ? "Hide" : "View"} Analytics
              </Button>
            </div>
          </CardHeader>
          {showAnalytics && (
            <CardContent className="px-4 sm:px-6 pb-4 border-b">
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : analyticsError ? (
                <div className="text-sm text-destructive py-4">
                  {analyticsError instanceof Error
                    ? analyticsError.message
                    : "Failed to load analytics"}
                </div>
              ) : analyticsData?.analytics ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      Contribution Analytics
                    </h3>
                    <div className="text-sm text-muted-foreground mb-4">
                      Total contributions: {analyticsData.analytics.total}
                    </div>

                    {/* By Source */}
                    {analyticsData.analytics.bySource.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase">
                          By Source
                        </h4>
                        <div className="space-y-2">
                          {analyticsData.analytics.bySource.map((item) => (
                            <div
                              key={item.source}
                              className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                            >
                              <span className="font-medium">{item.source}</span>
                              <span className="text-muted-foreground">
                                {item.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* By School */}
                    {analyticsData.analytics.bySchool.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase">
                          By School
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {analyticsData.analytics.bySchool.map((item) => (
                            <div
                              key={item.school_name}
                              className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                            >
                              <span className="font-medium">
                                {item.school_name}
                              </span>
                              <span className="text-muted-foreground">
                                {item.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* By Source and School */}
                    {analyticsData.analytics.bySourceAndSchool.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase">
                          By Source and School
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {analyticsData.analytics.bySourceAndSchool.map(
                            (item, idx) => (
                              <div
                                key={`${item.source}-${item.school_name}-${idx}`}
                                className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                              >
                                <span>
                                  <span className="font-medium">
                                    {item.source}
                                  </span>
                                  {" • "}
                                  <span className="text-muted-foreground">
                                    {item.school_name}
                                  </span>
                                </span>
                                <span className="text-muted-foreground">
                                  {item.count}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4">
                  No analytics data available
                </div>
              )}
            </CardContent>
          )}
          <CardContent className="p-3 sm:p-4 md:p-6">
            {submissions.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground text-xs sm:text-sm">
                No contributions found
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-md p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-semibold truncate">
                            {submission.companies.name}
                          </h3>
                          <Badge
                            variant={getStatusBadgeVariant(submission.status)}
                            className="text-xs px-1.5 py-0"
                          >
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            <span className="font-medium">Year:</span>{" "}
                            {submission.year}
                          </span>
                          <span>
                            <span className="font-medium">Term:</span>{" "}
                            {submission.term}
                          </span>
                          {submission.intern_type && (
                            <span>
                              <span className="font-medium">Type:</span>{" "}
                              {submission.intern_type}
                            </span>
                          )}
                          <span>
                            <span className="font-medium">Return Offer:</span>{" "}
                            {submission.return_offer_extended ? "Yes" : "No"}
                          </span>
                          {submission.return_offer_extended &&
                            submission.position_type && (
                              <span>
                                <span className="font-medium">Position:</span>{" "}
                                {submission.position_type}
                              </span>
                            )}
                          {submission.linkedin_url && (
                            <a
                              href={submission.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              LinkedIn
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {submission.submitted_at && (
                            <span className="text-xs">
                              {new Date(
                                submission.submitted_at
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {submission.status === "waiting" && (
                        <div className="flex gap-1.5 shrink-0 sm:flex-row flex-col">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(submission.id)}
                            disabled={updateStatusMutation.isPending}
                            className="h-7 px-2 text-xs bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDecline(submission.id)}
                            disabled={updateStatusMutation.isPending}
                            className="h-7 px-2 text-xs w-full sm:w-auto"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit CTA */}
        <SubmitCTA />
      </div>
    </div>
  );
}
