import { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SubmissionItem {
  id: number | string;
  year: number;
  term: string;
  return_offer_extended: boolean;
  intern_type?: string | null;
  position_type?: string | null;
  submitted_at?: string | null;
}

export interface SubmissionsListProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  submissions: SubmissionItem[];
  limit?: number;
  showCount?: boolean;
  className?: string;
}

export default function SubmissionsList({
  title = "Submissions",
  description,
  icon: Icon = TrendingUp,
  submissions,
  limit = 10,
  showCount = true,
  className = "",
}: SubmissionsListProps) {
  if (submissions.length === 0) {
    return null;
  }

  const displayedSubmissions = submissions.slice(0, limit);
  const hasMore = submissions.length > limit;

  return (
    <div
      className={`mb-6 sm:mb-12 pb-6 sm:pb-12 border-b border-border/50 ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          {description}
        </p>
      )}
      <div>
        <div className="space-y-2 sm:space-y-3">
          {displayedSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="border border-border rounded-lg p-3 sm:p-4 hover:bg-accent/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <Badge
                      variant={
                        submission.return_offer_extended
                          ? "success"
                          : "secondary"
                      }
                      className="font-medium text-xs"
                    >
                      {submission.return_offer_extended
                        ? "Offer Extended"
                        : "No Offer"}
                    </Badge>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {submission.year} • {submission.term}
                    </span>
                    {submission.intern_type && (
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                        • {submission.intern_type}
                      </span>
                    )}
                    {submission.position_type && (
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                        • {submission.position_type}
                      </span>
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
            </div>
          ))}
          {hasMore && showCount && (
            <div className="text-center text-xs sm:text-sm font-medium text-muted-foreground pt-2 sm:pt-4">
              Showing {limit} of {submissions.length} submissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
