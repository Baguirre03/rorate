"use client";

import Link from "next/link";
import { Gift, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";

export interface HeaderWithCTAProps {
  year: number;
  onTrackClick?: (
    event: string,
    data?: Record<string, string | number>
  ) => void;
  className?: string;
}

export default function HeaderWithCTA({
  year,
  onTrackClick,
  className = "",
}: HeaderWithCTAProps) {
  const { user, loading: authLoading } = useAuth();
  return (
    <>
      {/* Header */}
      <div className={`mb-8 sm:mb-12 ${className}`}>
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-2">
            Top Companies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Rankings based on {year} return offer data
          </p>
        </div>
      </div>

      {/* Top CTA */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              {!authLoading && !user ? (
                <>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <Gift className="h-4 w-4 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <h2 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                      Sign in and submit a return offer to see return offer
                      rates
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Share your experience and enter our $15 giftcard giveaway.
                    Every 100 submissions triggers a new giveaway!
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <Gift className="h-4 w-4 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <h2 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                      Submit Your Return Offer & Enter to Win
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Share your experience and enter our $15 giftcard giveaway.
                    Every 100 submissions triggers a new giveaway!
                  </p>
                </>
              )}
            </div>
            {!authLoading && !user ? (
              <Link
                href="/login?redirectTo=/submit"
                className="shrink-0 w-full sm:w-auto"
              >
                <Button
                  size="default"
                  className="w-full sm:w-auto text-sm px-4 sm:px-5 py-2.5 sm:py-3 h-auto font-medium shadow-sm hover:shadow transition-all duration-200"
                  onClick={() =>
                    onTrackClick?.("click_submit_cta_top", {
                      page: "top_companies",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Sign in & Submit Return Offer
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/submit" className="shrink-0 w-full sm:w-auto">
                <Button
                  size="default"
                  className="w-full sm:w-auto text-sm px-4 sm:px-5 py-2.5 sm:py-3 h-auto font-medium shadow-sm hover:shadow transition-all duration-200"
                  onClick={() =>
                    onTrackClick?.("click_submit_cta_top", {
                      page: "top_companies",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Submit Return Offer
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
