"use client";

import { Lock } from "lucide-react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { CompanyStats } from "@/hooks/useTopCompanies";

interface HiddenCompaniesSkeletonProps {
  companies: CompanyStats[];
}

export default function HiddenCompaniesSkeleton({
  companies,
}: HiddenCompaniesSkeletonProps) {
  return (
    <>
      {companies.map((company, index) => (
        <div
          key={`${company.name}-${index}`}
          className="border-b border-border/50 opacity-60 cursor-not-allowed"
        >
          <div className="py-4 sm:py-5">
            <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 items-center">
              {/* Rank Number */}
              <div className="text-center">
                <span className="text-sm sm:text-base font-medium text-muted-foreground">
                  {index + 2}
                </span>
              </div>

              {/* Company Logo */}
              <div>
                {company.logoUrl ? (
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border border-border/50 bg-muted flex items-center justify-center opacity-60">
                    <Image
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-muted border border-border/50 flex items-center justify-center opacity-60">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Company Name */}
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate opacity-60">
                  {company.name}
                </h3>
              </div>

              {/* Submissions - Hidden */}
              <div className="text-right">
                <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
              </div>

              {/* Offers - Hidden */}
              <div className="text-right">
                <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
              </div>

              {/* RO Rate - Hidden */}
              <div className="text-right">
                <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
              </div>

              {/* Arrow - Hidden */}
              <div></div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden px-4">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                {/* Rank Number */}
                <div className="shrink-0 w-8 text-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 2}
                  </span>
                </div>

                {/* Company Logo */}
                <div className="shrink-0">
                  {company.logoUrl ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border/50 bg-muted flex items-center justify-center opacity-60">
                      <Image
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted border border-border/50 flex items-center justify-center opacity-60">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Company Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold tracking-tight text-foreground truncate mb-1 opacity-60">
                    {company.name}
                  </h3>
                </div>
              </div>

              {/* Stats - Hidden with locks */}
              <div className="flex items-center gap-4">
                <div className="text-right flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Submissions
                  </div>
                  <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
                </div>
                <div className="text-right flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Offers
                  </div>
                  <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
                </div>
                <div className="text-right flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    RO Rate
                  </div>
                  <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
