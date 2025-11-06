"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubmitCTA() {
  return (
    <div className="mt-12 pt-12 border-t border-border">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          Share Your Experience
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Help others by submitting your return offer information. All
          submissions are reviewed before being published.
        </p>
        <Link href="/submit">
          <Button size="lg" variant="outline" className="font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Submit Your Return Offer
          </Button>
        </Link>
      </div>
    </div>
  );
}
