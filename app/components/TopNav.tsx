"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySearch from "./CompanySearch";
import { useCompanySearch } from "@/hooks/useCompanySearch";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { handleCompanySelect } = useCompanySearch();

  // Don't show on homepage
  if (pathname === "/") {
    return null;
  }

  const isOnCompaniesPage = pathname === "/companies";
  const backButtonText = isOnCompaniesPage
    ? "Back to Home"
    : "Back to Top Companies";
  const backButtonPath = isOnCompaniesPage ? "/" : "/companies";

  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => router.push(backButtonPath)}
            className="shrink-0 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backButtonText}
          </Button>
          <div className="flex-1 max-w-2xl">
            <CompanySearch
              onCompanySelect={handleCompanySelect}
              className="w-full"
              clearOnSelect={true}
            />
          </div>
          <div className="shrink-0 ml-auto">
            <Link
              href="/"
              className="text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors"
            >
              rorates.fyi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
