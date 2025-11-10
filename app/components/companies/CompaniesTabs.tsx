import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CompanyStats } from "@/hooks/useTopCompanies";
import TabContent from "./TabContent";

export interface CompaniesTabsProps {
  activeTab: "most-submissions" | "best-rates" | "worst-rates";
  onTabChange: (value: string) => void;
  year: number;
  companies: CompanyStats[];
  hasMore: boolean;
  onLoadMore?: () => void;
  isLoadingMore: boolean;
  isLoading: boolean;
  className?: string;
}

export default function CompaniesTabs({
  activeTab,
  onTabChange,
  year,
  companies,
  hasMore,
  onLoadMore,
  isLoadingMore,
  isLoading,
  className = "",
}: CompaniesTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={className}>
      <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-4 sm:mb-6">
        <TabsTrigger
          value="most-submissions"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Most Submissions</span>
          <span className="sm:hidden">Submissions</span>
        </TabsTrigger>
        <TabsTrigger
          value="best-rates"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Best RO Rates</span>
          <span className="sm:hidden">Best Rates</span>
        </TabsTrigger>
        <TabsTrigger
          value="worst-rates"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Worst RO Rates</span>
          <span className="sm:hidden">Worst Rates</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="most-submissions" className="mt-6 sm:mt-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Companies ranked by total number of submissions in {year}
          </p>
        </div>
        <TabContent
          companies={companies}
          emptyMessage="No submission data available for this category."
          icon={BarChart3}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="best-rates" className="mt-6 sm:mt-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Companies with the highest return offer rates in {year} (minimum 3
            submissions required)
          </p>
        </div>
        <TabContent
          companies={companies}
          emptyMessage="No companies meet the minimum submission threshold for rate rankings."
          icon={TrendingUp}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="worst-rates" className="mt-6 sm:mt-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Companies with the lowest return offer rates in {year} (minimum 3
            submissions required)
          </p>
        </div>
        <TabContent
          companies={companies}
          emptyMessage="No companies meet the minimum submission threshold for rate rankings."
          icon={TrendingDown}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
