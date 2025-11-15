"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySearch from "./CompanySearch";
import { useCompanySearch } from "@/hooks/useCompanySearch";
import useAuth from "@/hooks/useAuth";
import Logo from "./Logo";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { handleCompanySelect } = useCompanySearch();
  const { user } = useAuth();

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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 sm:gap-4 md:gap-6 items-center">
          <Button
            variant="ghost"
            onClick={() => router.push(backButtonPath)}
            className="shrink-0 -ml-2 self-start sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>{backButtonText}</span>
          </Button>
          <div className="flex justify-center min-w-0">
            <div className="w-full max-w-2xl">
              <CompanySearch
                onCompanySelect={handleCompanySelect}
                className="w-full"
                clearOnSelect={true}
              />
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-4 justify-end">
            {user && (
              <div className="relative group">
                <Link
                  href="/me"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background hover:bg-accent transition-colors"
                  aria-label="Account"
                >
                  <User className="h-4 w-4" />
                </Link>
                <div className="absolute right-0 top-full mt-2 px-2 py-1 text-xs font-medium text-white bg-foreground rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  View Account
                  <div className="absolute -top-1 right-2 w-2 h-2 bg-foreground rotate-45"></div>
                </div>
              </div>
            )}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors h-5"
            >
              <Logo className="w-5 h-5 text-foreground" />
              <span className="leading-5">rorates.fyi</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
