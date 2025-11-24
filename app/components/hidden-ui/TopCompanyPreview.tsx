"use client";

import { useTopCompanies } from "@/hooks/useTopCompanies";
import useAuth from "@/hooks/useAuth";
import useHasSubmitted from "@/hooks/useHasSubmitted";
import CompanyCard from "@/components/companies/CompanyCard";

interface TopCompanyPreviewProps {
  sort?: "most-submissions" | "best-rates" | "worst-rates";
}

export default function TopCompanyPreview({
  sort = "most-submissions",
}: TopCompanyPreviewProps) {
  const { user } = useAuth();
  const { hasSubmitted } = useHasSubmitted();
  const hideSubmissionsAndOffers = !user || hasSubmitted !== true;
  // Fetch 3 companies when locked to show percentages, 1 when unlocked
  const { data, isLoading, error } = useTopCompanies(
    sort,
    hideSubmissionsAndOffers ? 3 : 1
  );

  if (isLoading) {
    return (
      <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
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
        <div className="py-4 sm:py-5">
          <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 items-center">
            <div className="text-center">
              <div className="h-4 w-4 bg-muted rounded animate-pulse mx-auto" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-5 w-12 bg-muted rounded animate-pulse ml-auto" />
            <div className="h-5 w-12 bg-muted rounded animate-pulse ml-auto" />
            <div className="h-5 w-12 bg-muted rounded animate-pulse ml-auto" />
            <div />
          </div>
          <div className="md:hidden px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-4 bg-muted rounded animate-pulse" />
              <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
              <div className="flex-1 h-5 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
              <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
              <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstPage = data?.pages?.[0];
  if (error || !firstPage || !firstPage.data || firstPage.data.length === 0) {
    return null;
  }

  const companies = firstPage.data;
  const companiesToShow = hideSubmissionsAndOffers
    ? companies.slice(0, 3)
    : [companies[0]];

  return (
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
      {companiesToShow.map((company, index) => (
        <CompanyCard
          key={company.name}
          company={company}
          rank={index + 1}
          hideSubmissionsAndOffers={hideSubmissionsAndOffers}
        />
      ))}
    </div>
  );
}
