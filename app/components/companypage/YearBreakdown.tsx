import { LucideIcon } from "lucide-react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface YearData {
  year: number;
  total: number;
  offers: number;
  percentage: number;
}

export interface YearBreakdownProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  years: YearData[];
  className?: string;
}

export default function YearBreakdown({
  title = "Year Breakdown",
  description = "Return offer rates by year",
  icon: Icon = Calendar,
  years,
  className = "",
}: YearBreakdownProps) {
  if (years.length === 0) {
    return null;
  }

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
        <div className="space-y-4 sm:space-y-6">
          {years.map((yearData) => (
            <div
              key={yearData.year}
              className="border-b border-border last:border-0 pb-4 sm:pb-6 last:pb-0"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <span className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                    {yearData.year}
                  </span>
                  <Badge variant="secondary" className="font-medium text-xs">
                    {yearData.total} submission
                    {yearData.total !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                    {yearData.percentage}%
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">
                    {yearData.offers} of {yearData.total}
                  </div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-green-500 dark:bg-green-400"
                  style={{ width: `${yearData.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
