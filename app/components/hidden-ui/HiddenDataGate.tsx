"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HiddenDataGateProps {
  message?: string;
  ctaText?: string;
  redirectTo?: string;
}

export default function HiddenDataGate({
  message = "Submit a return offer to see data",
  ctaText = "Sign in to View Data",
  redirectTo = "/submit",
}: HiddenDataGateProps) {
  return (
    <Card className="p-6 sm:p-8 text-center border border-border bg-card">
      <div className="max-w-md mx-auto space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted border border-border mb-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
          {message}
        </h3>
        <p className="text-sm text-muted-foreground">
          Create an account and submit your return offer experience to unlock
          full access to return offer rates and statistics.
        </p>
        <div className="pt-2">
          <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}>
            <Button size="default" className="w-full sm:w-auto">
              {ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
