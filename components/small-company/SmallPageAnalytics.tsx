"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics/events";
import { initializeAttribution } from "@/lib/attribution";

export function SmallPageAnalytics() {
  useEffect(() => {
    initializeAttribution();
    trackEvent("SMALL_PAGE_VIEW", { segment: "small_company" });
  }, []);
  return null;
}
