"use client";

import posthog from "posthog-js";

export function useAnalytics() {
  const trackClick = (
    eventName: string,
    properties?: Record<string, string | number>
  ) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  };

  const trackPageView = (
    pageName: string,
    properties?: Record<string, string | number>
  ) => {
    if (posthog) {
      posthog.capture("page_view", {
        page: pageName,
        ...properties,
      });
    }
  };

  return {
    trackClick,
    trackPageView,
    isProduction: false, // PostHog works in all environments
  };
}
