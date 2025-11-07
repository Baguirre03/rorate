"use client";

import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";

interface SubmissionCountResponse {
  count: number;
}

export default function SubmissionCounter() {
  const { data, isLoading } = useQuery<SubmissionCountResponse>({
    queryKey: ["submission-count"],
    queryFn: async () => {
      const response = await fetch("/api/submissions/count");
      if (!response.ok) {
        throw new Error("Failed to fetch submission count");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const count = data?.count || 0;
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

  return (
    <div className="text-center py-5 border-t border-border">
      <div className="inline-flex flex-col items-center gap-3 max-w-lg mx-auto px-4">
        <div className="inline-flex items-center gap-2 text-sm">
          <Gift className="h-4 w-4 text-primary" />
          <span className="text-foreground">
            <span className="font-semibold">{count.toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">approved submissions</span>
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed max-w-md">
          <span className="font-medium">
            $15 giveaway every 100 submissions!
          </span>{" "}
          <span className="text-muted-foreground">
            Winner selected randomly -- Reached out via LinkedIn.
          </span>
        </p>
        <div className="w-full max-w-xs space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {submissionsNeeded} more to next $15 giveaway
            </span>
            <span className="font-medium text-foreground">{progress}/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/60 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
