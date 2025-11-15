"use client";

import { useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  LogOut,
  Mail,
  Calendar,
  User,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import useHasSubmitted from "@/hooks/useHasSubmitted";
import LoginContainer from "@/components/login/LoginContainer";
import LoginLoading from "@/components/login/LoginLoading";

function MePageContent() {
  const { user, loading, logout } = useAuth();
  const { submissions, isLoading: submissionsLoading } = useHasSubmitted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && searchParams.get("signedIn") === "true") {
      queryClient.invalidateQueries({ queryKey: ["hasSubmitted"] });
      toast.success("Successfully signed in!");
      // Remove the query parameter from URL
      router.replace("/me");
    }
  }, [user, loading, searchParams, router, queryClient]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      queryClient.invalidateQueries({ queryKey: ["hasSubmitted"] });
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [logout, router, queryClient]);

  if (loading) {
    return <LoginLoading />;
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "default";
      case "waiting":
        return "secondary";
      case "declined":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <LoginContainer>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">
          Your Account
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-foreground">Account Status</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {user.user_metadata?.full_name && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {user.user_metadata.full_name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Member Since
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Submissions Card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">My Submissions</h2>
          </div>

          {submissionsLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Loading submissions...
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No submissions yet. Submit your return offer to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border rounded-md p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">
                        {submission.companies?.name || "Unknown Company"}
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
                        >
                          LinkedIn
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {submission.submitted_at && (
                      <div className="text-xs text-muted-foreground">
                        Submitted:{" "}
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full"
          size="lg"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </LoginContainer>
  );
}

export default function MePage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <MePageContent />
    </Suspense>
  );
}
