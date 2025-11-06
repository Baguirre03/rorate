"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
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
import SubmitCTA from "@/components/SubmitCTA";

type SubmissionWithCompany = {
  id: number;
  company_id: number;
  year: number;
  term: string;
  intern_type: string | null;
  linkedin_url: string | null;
  return_offer_extended: boolean;
  status: string;
  submitted_at: string | null;
  companies: {
    id: number;
    name: string;
  };
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

  const { data, isLoading, error } = useQuery<{
    data: SubmissionWithCompany[];
  }>({
    queryKey: ["submissions", "all"],
    queryFn: async () => {
      const response = await fetch("/api/submissions?all=true");
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      return response.json();
    },
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
      <div className="bg-background py-12 px-4">
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
      <div className="bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                Failed to load submissions. Please try again.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const submissions = data?.data || [];

  return (
    <div className="bg-background py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Submissions</CardTitle>
            <CardDescription className="text-sm">
              Review and manage all submissions ({submissions.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No submissions found
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-md p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold truncate">
                            {submission.companies.name}
                          </h3>
                          <Badge
                            variant={getStatusBadgeVariant(submission.status)}
                            className="text-xs px-1.5 py-0"
                          >
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(submission.id)}
                            disabled={updateStatusMutation.isPending}
                            className="h-7 px-2 text-xs bg-foreground text-background hover:bg-foreground/90"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDecline(submission.id)}
                            disabled={updateStatusMutation.isPending}
                            className="h-7 px-2 text-xs"
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
