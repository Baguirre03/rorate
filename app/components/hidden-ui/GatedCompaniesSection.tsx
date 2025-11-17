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
  const { data, isLoading } = useTopCompanies(sort, 5); // Fetch 5 to show top + 4 hidden

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
  const hasSubmittedRO = hasSubmitted === true;

  // Show top company preview
  const firstPage = data?.pages?.[0];
  const showTopCompany =
    !isLoading && firstPage && firstPage.data && firstPage.data.length > 0;
  const hiddenCompanies = firstPage?.data?.slice(1, 5) || []; // Get companies 2-5
  const companyCount = companyCountData?.count || 0;

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
          <HiddenCompaniesSkeleton companies={hiddenCompanies} />
          {/* Company count display */}
          {!isCompanyCountLoading && companyCount > 5 && (
            <div className="px-4 sm:px-6 py-4 text-center border-t border-border bg-muted/50">
              <p className="text-base font-medium text-foreground">
                (and return offer rates for {companyCount - 5} other{" "}
                {companyCount - 5 === 1 ? "company" : "companies"})
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
