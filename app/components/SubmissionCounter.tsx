"use client";

import { useQuery } from "@tanstack/react-query";
import { Gift, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SubmissionCountResponse {
  count: number;
}

export default function SubmissionCounter() {
  const pathname = usePathname();
  const isSubmitPage = pathname === "/submit";

  const { data, isLoading, error } = useQuery<SubmissionCountResponse>({
    queryKey: ["submission-count"],
    queryFn: async () => {
      const response = await fetch("/api/submissions/count", {
        cache: "no-store", // Prevent caching issues
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to fetch submission count: ${response.status}`
        );
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const count = data?.count ?? 0;
  const nextMilestone = Math.ceil((count + 1) / 100) * 100;
  const progress = count % 100;
  const progressPercent = (progress / 100) * 100;
  const submissionsNeeded = nextMilestone - count;

  if (isLoading) {
    return (
      <div className="text-center py-5 border-t border-border">
        <div className="inline-flex items-center gap-2 text-sm">
          <Gift className="h-4 w-4 text-primary animate-pulse" />
          <span className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching submission count:", error);
    // Silently fail - don't show error to users, just show 0 or hide component
    return null;
  }

  return (
    <div className="text-center py-8 border-t border-border">
      <div className="inline-flex flex-col items-center gap-4 max-w-lg mx-auto px-4">
        <div className="inline-flex items-center gap-2 text-sm mb-1">
          <Gift className="h-5 w-5 text-primary" />
          <span className="text-foreground">
            <span className="font-semibold">{count.toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">approved submissions</span>
          </span>
        </div>
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground leading-relaxed">
            Submit your return offer & enter to win a $15 giftcard!
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Every 100 submissions triggers a giveaway. Winner selected randomly
            and reached out via LinkedIn.
          </p>
        </div>
        <div className="w-full max-w-xs space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {submissionsNeeded} more to next giveaway
            </span>
            <span className="font-medium text-foreground">{progress}/100</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/60 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {!isSubmitPage && (
            <Link href="/submit" className="block w-full mt-4">
              <Button
                size="lg"
                className="w-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                Submit Your Return Offer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
