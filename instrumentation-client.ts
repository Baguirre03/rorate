import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST, // Use Next.js rewrite proxy to avoid ad blockers
  defaults: "2025-05-24",
});
