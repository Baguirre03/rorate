"use client";

import { useQuery } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import useHasSubmitted from "@/hooks/useHasSubmitted";
import { useTopCompanies } from "@/hooks/useTopCompanies";
import TopCompanyPreview from "./TopCompanyPreview";
import HiddenCompaniesSkeleton from "./HiddenCompaniesSkeleton";
import HiddenDataGate from "./HiddenDataGate";

interface GatedCompaniesSectionProps {
  sort?: "most-submissions" | "best-rates" | "worst-rates";
  showGate?: boolean;
}

export default function GatedCompaniesSection({
  sort = "most-submissions",
  showGate = true,
}: GatedCompaniesSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasSubmitted, isLoading: hasSubmittedLoading } = useHasSubmitted();
  const hasSubmittedRO = hasSubmitted === true;
  const hideSubmissionsAndOffers = !user || hasSubmittedRO !== true;
  const { data, isLoading } = useTopCompanies(
    sort,
    hideSubmissionsAndOffers ? 7 : 5
  );

  // Fetch company count
  const { data: companyCountData, isLoading: isCompanyCountLoading } =
    useQuery<{
      count: number;
    }>({
      queryKey: ["companyCount"],
      queryFn: async () => {
        const response = await fetch("/api/companies/count");
        if (!response.ok) {
          throw new Error("Failed to fetch company count");
        }
        return response.json();
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

  const isLoadingStatus = authLoading || hasSubmittedLoading;
  const isLoggedIn = !!user;

  // Show top company preview
  const firstPage = data?.pages?.[0];
  const showTopCompany =
    !isLoading && firstPage && firstPage.data && firstPage.data.length > 0;
  // When locked, TopCompanyPreview shows 3 companies (indices 0-2), so hidden should start at index 3
  // When unlocked, TopCompanyPreview shows 1 company (index 0), so hidden should start at index 1
  const topPreviewCount = hideSubmissionsAndOffers ? 3 : 1;
  // Get next 4 companies after top preview (or however many are available)
  const hiddenCompanies =
    firstPage?.data?.slice(topPreviewCount, topPreviewCount + 4) || [];
  const companyCount = companyCountData?.count || 0;
  // Calculate total companies shown: top preview + hidden companies
  const companiesShown = topPreviewCount + hiddenCompanies.length;

  // Determine message based on auth and submission status
  const message =
    isLoggedIn && !hasSubmittedRO
      ? "Submit a return offer to see data"
      : "Sign in and submit a return offer to see data";

  const ctaText =
    isLoggedIn && !hasSubmittedRO
      ? "Submit Return Offer"
      : "Sign In and Submit";

  const redirectTo = "/submit";

  return (
    <div className="space-y-4">
      {/* Show the top company */}
      <TopCompanyPreview sort={sort} />

      {/* Show hidden companies (visible but locked) */}
      {showTopCompany && hiddenCompanies.length > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
          <HiddenCompaniesSkeleton
            companies={hiddenCompanies}
            startRank={topPreviewCount + 1}
          />
          {/* Company count display */}
          {!isCompanyCountLoading && companyCount > companiesShown && (
            <div className="px-4 sm:px-6 py-4 text-center border-t border-border bg-muted/50">
              <p className="text-base font-medium text-foreground">
                (and return offer rates for {companyCount - companiesShown}{" "}
                other{" "}
                {companyCount - companiesShown === 1 ? "company" : "companies"})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Show the gate component */}
      {showGate && !isLoadingStatus && (
        <div className="pt-4">
          <HiddenDataGate
            message={message}
            ctaText={ctaText}
            redirectTo={redirectTo}
          />
        </div>
      )}
    </div>
  );
}
