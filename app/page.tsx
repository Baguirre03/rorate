"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySearch from "@/components/CompanySearch";
import SubmissionCounter from "@/components/SubmissionCounter";
import { useCompanySearch } from "@/hooks/useCompanySearch";
import { useAnalytics } from "@/hooks/useAnalytics";
import Link from "next/link";

export default function Home() {
  const { handleCompanySelect } = useCompanySearch();
  const { trackClick, trackPageView } = useAnalytics();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    trackPageView("home");
    // Trigger animation after component mounts using requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-12 sm:pt-20 md:pt-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20 md:pb-32 w-full">
        {/* Hero Section - Search Focused */}
        <div className="text-center">
          <h1
            className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 sm:mb-6 tracking-tight text-foreground transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{
              transitionDelay: mounted ? "0ms" : "0ms",
            }}
          >
            Return Offer Rates.fyi
          </h1>
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed px-2 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{
              transitionDelay: mounted ? "150ms" : "0ms",
            }}
          >
            Discover return offer rates for tech companies. Search by company
            name to see detailed statistics and trends.
          </p>

          {/* Search Section */}
          <div
            className={`mb-8 sm:mb-12 md:mb-16 flex justify-center px-2 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{
              transitionDelay: mounted ? "300ms" : "0ms",
            }}
          >
            <div className="max-w-2xl w-full">
              <CompanySearch
                onCompanySelect={handleCompanySelect}
                className="w-full"
              />
            </div>
          </div>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-3 justify-center items-center px-2 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{
              transitionDelay: mounted ? "450ms" : "0ms",
            }}
          >
            <Link
              href="/companies"
              className="w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-7 py-4 sm:py-5 h-auto font-medium"
                onClick={() =>
                  trackClick("click_top_companies_button", { page: "home" })
                }
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Top Companies
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link
              href="/submit"
              className="w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-7 py-4 sm:py-5 h-auto font-medium"
                onClick={() =>
                  trackClick("click_submit_button", { page: "home" })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Your Return Offer
              </Button>
            </Link>
          </div>

          {/* Submission Counter - Temporarily on homepage */}
          <div
            className={`mt-12 sm:mt-16 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{
              transitionDelay: mounted ? "600ms" : "0ms",
            }}
          >
            <SubmissionCounter />
          </div>
        </div>
      </div>
    </div>
  );
}
