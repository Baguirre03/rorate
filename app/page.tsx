"use client";

import { TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySearch from "@/components/CompanySearch";
import { useCompanySearch } from "@/hooks/useCompanySearch";
import Link from "next/link";

export default function Home() {
  const { handleCompanySelect } = useCompanySearch();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-20 sm:py-32">
        {/* Hero Section - Search Focused */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold mb-6 tracking-tight text-foreground">
            Return Offer Rates.fyi
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            Discover return offer rates for tech companies. Search by company
            name to see detailed statistics and trends.
          </p>

          {/* Search Section */}
          <div className="mb-16">
            <div className="max-w-2xl mx-auto">
              <CompanySearch
                onCompanySelect={handleCompanySelect}
                className="w-full"
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-2xl mx-auto">
            <Link href="/companies" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-7 py-5 h-auto font-medium"
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
