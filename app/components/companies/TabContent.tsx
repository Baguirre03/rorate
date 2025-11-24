import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyStats } from "@/hooks/useTopCompanies";
import CompanyCard from "./CompanyCard";
import TableSkeleton from "./TableSkeleton";

export interface TabContentProps {
  companies: CompanyStats[];
  emptyMessage: string;
  icon: React.ElementType;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  isLoading?: boolean;
}

export default function TabContent({
  companies,
  emptyMessage,
  icon: Icon,
  hasMore,
  onLoadMore,
  isLoadingMore,
  isLoading,
}: TabContentProps) {
  // Show skeleton only on initial load when we have no companies
  if (isLoading && companies.length === 0) {
    return <TableSkeleton />;
  }

  if (companies.length === 0 && !isLoading) {
    return (
      <div className="py-12 sm:py-16 text-center">
        <Icon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          No Data Available
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
        {/* Table Header - Desktop Only */}
        <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-muted/30 border-b border-border/50">
          <div></div>
          <div></div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Company
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
            Contributions
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
            Offers
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
            RO Rate
          </div>
          <div></div>
        </div>
        {companies.map((company, index) => (
          <CompanyCard
            key={`${company.name}-${index}`}
            company={company}
            rank={index + 1}
          />
        ))}
        {/* Show loader at bottom when loading more */}
        {isLoadingMore && (
          <div className="border-b border-border/50 last:border-0">
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
      {hasMore && onLoadMore && !isLoadingMore && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={onLoadMore}
            variant="default"
            disabled={isLoadingMore}
            className="w-full sm:w-auto min-w-[140px] px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span>Load More Companies</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
