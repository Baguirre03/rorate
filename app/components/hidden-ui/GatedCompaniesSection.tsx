"use client";

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

  const isLoadingStatus = authLoading || hasSubmittedLoading;
  const isLoggedIn = !!user;
  const hasSubmittedRO = hasSubmitted === true;

  // Show top company preview
  const firstPage = data?.pages?.[0];
  const showTopCompany =
    !isLoading && firstPage && firstPage.data && firstPage.data.length > 0;
  const hiddenCompanies = firstPage?.data?.slice(1, 5) || []; // Get companies 2-5

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
