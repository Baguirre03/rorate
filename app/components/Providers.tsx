"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const isProduction = process.env.ENVIRONMENT === "prod";

  // PostHog is initialized in instrumentation-client.ts (Next.js 15.3+ feature)
  // We just need to wrap with PostHogProvider for React hooks (usePostHog) to work
  return (
    <PHProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" />
        {isProduction && <Analytics />}
      </QueryClientProvider>
    </PHProvider>
  );
}
