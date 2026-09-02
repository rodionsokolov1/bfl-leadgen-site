"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics/events";
import { initializeAttribution } from "@/lib/attribution";
import type { AnalyticsEventName } from "@/types/analytics";

export function MultiGeoAnalytics() {
  useEffect(() => {
    initializeAttribution();
    trackEvent("SEGMENT_MULTI_GEO_OPEN", { segment: "multi_geo" });

    const system = document.querySelector<HTMLElement>("[data-multi-geo-system]");
    const observer = system
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            trackEvent("MULTI_GEO_SYSTEM_VIEW", { segment: "multi_geo" });
            observer?.disconnect();
          },
          { threshold: 0.35 },
        )
      : null;

    if (system && observer) observer.observe(system);

    function handleTrackedClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const link = target?.closest<HTMLElement>("[data-analytics-event]");
      const eventName = link?.dataset.analyticsEvent as AnalyticsEventName | undefined;
      if (eventName) trackEvent(eventName, { segment: "multi_geo" });
    }

    document.addEventListener("click", handleTrackedClick);
    return () => {
      observer?.disconnect();
      document.removeEventListener("click", handleTrackedClick);
    };
  }, []);

  return null;
}
