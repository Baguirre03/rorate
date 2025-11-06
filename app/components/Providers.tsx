"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "prod";

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" />
      {isProduction && <Analytics />}
    </QueryClientProvider>
  );
}
