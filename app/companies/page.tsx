"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePaginatedCompanies } from "@/hooks/usePaginatedCompanies";
import { useAnalytics } from "@/hooks/useAnalytics";
import useAuth from "@/hooks/useAuth";
import useHasSubmitted from "@/hooks/useHasSubmitted";
import SubmitCTA from "@/components/SubmitCTA";
import CompaniesErrorState from "@/components/companies/ErrorState";
import HeaderWithCTA from "@/components/companies/HeaderWithCTA";
import CompaniesTabs from "@/components/companies/CompaniesTabs";
import { GatedCompaniesSection } from "@/components/hidden-ui";

export default function TopCompaniesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasSubmitted, isLoading: hasSubmittedLoading } = useHasSubmitted();
  const [activeTab, setActiveTab] = useState<
    "most-submissions" | "best-rates" | "worst-rates"
  >("most-submissions");
  const { trackClick, trackPageView } = useAnalytics();

  const {
    companies: accumulatedCompanies,
    hasMore,
    year,
    isLoading,
    isLoadingMore,
    loadMore,
    error,
  } = usePaginatedCompanies(activeTab, 15);

  useEffect(() => {
    trackPageView("top_companies", { tab: activeTab });
  }, [trackPageView, activeTab]);

  const handleLoadMore = useCallback(() => {
    loadMore();
    trackClick("click_load_more_companies", {
      tab: activeTab,
      count: accumulatedCompanies.length + 15,
    });
  }, [activeTab, accumulatedCompanies.length, loadMore, trackClick]);

  const handleTabChange = useCallback(
    (value: string) => {
      const newTab = value as "most-submissions" | "best-rates" | "worst-rates";
      setActiveTab(newTab);
      trackClick("click_tab", { tab: value, page: "top_companies" });
    },
    [trackClick]
  );

  if (error) {
    return (
      <CompaniesErrorState
        title="Error"
        description="Failed to load top companies data. Please try again."
        onBack={() => {
          trackClick("click_back_button", { page: "top_companies" });
          router.push("/");
        }}
      />
    );
  }

  const isLoadingStatus = authLoading || hasSubmittedLoading;

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <HeaderWithCTA year={year} onTrackClick={trackClick} />
          <CompaniesTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            year={year}
            companies={[]}
            hasMore={false}
            onLoadMore={handleLoadMore}
            isLoadingMore={false}
            isLoading={true}
          />
        </div>
      </div>
    );
  }

  if (!user || (user && hasSubmitted !== true)) {
    return (
      <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <HeaderWithCTA year={year} onTrackClick={trackClick} />
          <GatedCompaniesSection sort={activeTab} />
        </div>
      </div>
    );
  }

  // User is logged in AND has submitted - show real content
  return (
    <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <HeaderWithCTA year={year} onTrackClick={trackClick} />

        <CompaniesTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          year={year}
          companies={accumulatedCompanies}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
          isLoading={isLoading}
        />

        <SubmitCTA />
      </div>
    </div>
  );
}
