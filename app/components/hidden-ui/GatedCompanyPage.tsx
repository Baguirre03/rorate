"use client";

import { Lock } from "lucide-react";
import CompanyHeader from "@/components/companypage/CompanyHeader";
import HiddenDataGate from "./HiddenDataGate";

interface GatedCompanyPageProps {
  companyName: string;
  company?: {
    name?: string;
    logoUrl?: string | null;
  } | null;
}

export default function GatedCompanyPage({
  companyName,
  company,
}: GatedCompanyPageProps) {
  return (
    <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <CompanyHeader
          companyName={companyName}
          company={company}
          subtitle="Return Offer Statistics"
        />

        {/* Skeleton Stats Display */}
        <div className="mb-6 sm:mb-12 pb-6 sm:pb-12 border-b border-border/50">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">
              Overall Statistics
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Return offer rate across all submissions
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-muted-foreground flex items-center gap-2">
                  <Lock className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Return Offer Rate
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-muted-foreground flex items-center gap-2">
                  <Lock className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Offers Extended
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-muted-foreground flex items-center gap-2">
                  <Lock className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Total Submissions
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-muted"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Data Gate */}
        <HiddenDataGate
          message="Submit a return offer to see data"
          ctaText="Sign in to View Data"
          redirectTo="/submit"
        />
      </div>
    </div>
  );
}
