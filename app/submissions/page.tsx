"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              Review and manage all submissions ({submissions.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No submissions found
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="border-l-4">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {submission.companies.name}
                            </h3>
                            <Badge
                              variant={getStatusBadgeVariant(submission.status)}
                            >
                              {submission.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Year:
                              </span>{" "}
                              {submission.year}
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Term:
                              </span>{" "}
                              {submission.term}
                            </div>
                            {submission.intern_type && (
                              <div>
                                <span className="text-muted-foreground">
                                  Type:
                                </span>{" "}
                                {submission.intern_type}
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">
                                Return Offer:
                              </span>{" "}
                              {submission.return_offer_extended ? "Yes" : "No"}
                            </div>
                          </div>
                          {submission.linkedin_url && (
                            <div>
                              <a
                                href={submission.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                              >
                                LinkedIn Profile
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          {submission.submitted_at && (
                            <div className="text-xs text-muted-foreground">
                              Submitted:{" "}
                              {new Date(
                                submission.submitted_at
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                        {submission.status === "waiting" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(submission.id)}
                              disabled={updateStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDecline(submission.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
