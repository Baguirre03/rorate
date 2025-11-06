"use client";

import { useEffect } from "react";
import { TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySearch from "@/components/CompanySearch";
import { useCompanySearch } from "@/hooks/useCompanySearch";
import { useAnalytics } from "@/hooks/useAnalytics";
import Link from "next/link";

export default function Home() {
  const { handleCompanySelect } = useCompanySearch();
  const { trackClick, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("home");
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-20 sm:pt-32">
      <div className="max-w-5xl mx-auto px-6 pb-20 sm:pb-32 w-full">
        {/* Hero Section - Search Focused */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold mb-6 tracking-tight text-foreground">
            Return Offer Rates.fyi
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            Discover return offer rates for tech companies. Search by company
            name to see detailed statistics and trends.
          </p>

          {/* Search Section */}
          <div className="mb-16 flex justify-center">
            <div className="max-w-2xl w-full">
              <CompanySearch
                onCompanySelect={handleCompanySelect}
                className="w-full"
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/companies" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-7 py-5 h-auto font-medium"
                onClick={() =>
                  trackClick("click_top_companies_button", { page: "home" })
                }
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Top Companies
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/submit" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-7 py-5 h-auto font-medium"
                onClick={() =>
                  trackClick("click_submit_button", { page: "home" })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Your Return Offer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
