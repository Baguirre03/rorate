import { Building2, ArrowRight, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompanyStats } from "@/hooks/useTopCompanies";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface CompanyCardProps {
  company: CompanyStats;
  rank: number;
  hideSubmissionsAndOffers?: boolean;
}

export default function CompanyCard({
  company,
  rank,
  hideSubmissionsAndOffers = false,
}: CompanyCardProps) {
  const { trackClick } = useAnalytics();

  return (
    <Link
      href={`/company/${encodeURIComponent(company.name)}`}
      className="block last:mb-0 cursor-pointer"
      onClick={() =>
        trackClick("click_company_card", { company: company.name, rank })
      }
    >
      <div className="border-b border-border/50 hover:bg-accent/30 transition-all duration-200 cursor-pointer group">
        <div className="py-4 sm:py-5">
          <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 items-center">
            {/* Rank Number */}
            <div className="text-center">
              <span className="text-sm sm:text-base font-medium text-muted-foreground">
                {rank}
              </span>
            </div>

            {/* Company Logo */}
            <div>
              {company.logoUrl ? (
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-muted border border-border/50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Company Name */}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                {company.name}
              </h3>
            </div>

            {/* Contributions */}
            <div className="text-right">
              {hideSubmissionsAndOffers ? (
                <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
              ) : (
                <div className="text-base font-semibold text-foreground">
                  {company.total}
                </div>
              )}
            </div>

            {/* Offers */}
            <div className="text-right">
              {hideSubmissionsAndOffers ? (
                <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
              ) : (
                <div className="text-base font-semibold text-foreground">
                  {company.offers}
                </div>
              )}
            </div>

            {/* RO Rate */}
            <div className="text-right">
              <div className="text-base font-semibold text-foreground">
                {company.percentage}%
              </div>
            </div>

            {/* Arrow */}
            <div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden px-4">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              {/* Rank Number */}
              <div className="shrink-0 w-8 text-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {rank}
                </span>
              </div>

              {/* Company Logo */}
              <div className="shrink-0">
                {company.logoUrl ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
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
                  <div className="w-10 h-10 rounded-md bg-muted border border-border/50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Company Name */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-foreground truncate mb-1">
                  {company.name}
                </h3>
              </div>
            </div>

            {/* Stats - Mobile Layout */}
            <div className="flex items-center gap-4">
              <div className="text-right flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Contributions
                </div>
                {hideSubmissionsAndOffers ? (
                  <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
                ) : (
                  <div className="text-sm font-semibold text-foreground">
                    {company.total}
                  </div>
                )}
              </div>
              <div className="text-right flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Offers
                </div>
                {hideSubmissionsAndOffers ? (
                  <Lock className="h-4 w-4 text-muted-foreground/50 ml-auto" />
                ) : (
                  <div className="text-sm font-semibold text-foreground">
                    {company.offers}
                  </div>
                )}
              </div>
              <div className="text-right flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">
                  RO Rate
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {company.percentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
