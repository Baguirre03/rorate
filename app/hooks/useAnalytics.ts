"use client";

import { track } from "@vercel/analytics";

export function useAnalytics() {
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "prod";

  const trackClick = (
    eventName: string,
    properties?: Record<string, string | number>
  ) => {
    if (isProduction) {
      track(eventName, properties);
    }
  };

  const trackPageView = (
    pageName: string,
    properties?: Record<string, string | number>
  ) => {
    if (isProduction) {
      track("page_view", {
        page: pageName,
        ...properties,
      });
    }
  };

  return {
    trackClick,
    trackPageView,
    isProduction,
  };
}
