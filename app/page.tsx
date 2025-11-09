"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySearch from "@/components/CompanySearch";
import SubmissionCounter from "@/components/SubmissionCounter";
import { useCompanySearch } from "@/hooks/useCompanySearch";
import { useAnalytics } from "@/hooks/useAnalytics";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";

const siteUrl = process.env.SITE_URL || "https://rorates.fyi";

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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Return Offer Rates.fyi",
    description:
      "Discover return offer rates for tech companies. Find out which companies extend the most return offers to interns.",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/company/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a return offer rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A return offer rate is the percentage of interns who receive a full-time or return internship offer from a company after completing their internship. It's calculated by dividing the number of interns who received return offers by the total number of internship submissions.",
        },
      },
      {
        "@type": "Question",
        name: "How do I find a company's return offer rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Search for the company name on Return Offer Rates.fyi to see their return offer rate, statistics, and detailed data including breakdowns by year, term, and intern type.",
        },
      },
      {
        "@type": "Question",
        name: "Which companies have the best return offer rates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Visit our Top Companies page to see companies ranked by return offer rates. You can view companies with the most submissions, best rates, or compare different companies.",
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={websiteSchema} />
      <StructuredData data={faqSchema} />
      <div className="min-h-screen bg-background flex items-start justify-center pt-12 sm:pt-20 md:pt-32 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20 md:pb-32 w-full relative z-10">
          {/* Hero Section - Search Focused */}
          <div className="text-center">
            <h1
              className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 sm:mb-8 tracking-tight text-foreground transition-all duration-700 ease-out ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
              style={{
                transitionDelay: mounted ? "0ms" : "0ms",
              }}
            >
              Return Offer Rates.fyi
            </h1>
            <p
              className={`text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-14 md:mb-18 max-w-2xl mx-auto leading-relaxed px-2 transition-all duration-700 ease-out ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
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
              className={`mb-10 sm:mb-14 md:mb-18 flex justify-center px-2 transition-all duration-700 ease-out ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
              style={{
                transitionDelay: mounted ? "300ms" : "0ms",
              }}
            >
              <div className="max-w-2xl w-full relative">
                <div className="absolute -inset-1 bg-border/30 rounded-lg blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-card border border-border/50 rounded-lg p-1 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CompanySearch
                    onCompanySelect={handleCompanySelect}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center px-2 transition-all duration-700 ease-out ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
              style={{
                transitionDelay: mounted ? "450ms" : "0ms",
              }}
            >
              <Link
                href="/companies"
                className="w-full sm:w-auto max-w-xs sm:max-w-none group"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-7 py-4 sm:py-5 h-auto font-medium shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5"
                  onClick={() =>
                    trackClick("click_top_companies_button", { page: "home" })
                  }
                >
                  <TrendingUp className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                  Top Companies
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link
                href="/submit"
                className="w-full sm:w-auto max-w-xs sm:max-w-none group"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-7 py-4 sm:py-5 h-auto font-medium border-2 hover:border-foreground/20 transition-all duration-200 group-hover:-translate-y-0.5 hover:shadow-sm"
                  onClick={() =>
                    trackClick("click_submit_button", { page: "home" })
                  }
                >
                  <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  Submit Your Return Offer
                </Button>
              </Link>
            </div>

            {/* Submission Counter - Temporarily on homepage */}
            <div
              className={`mt-16 sm:mt-20 transition-all duration-700 ease-out ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
              style={{
                transitionDelay: mounted ? "600ms" : "0ms",
              }}
            >
              <div className="relative">
                <div className="absolute inset-x-0 top-0 h-px bg-border/50"></div>
                <SubmissionCounter />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
