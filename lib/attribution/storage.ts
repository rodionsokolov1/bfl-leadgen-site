import type { AttributionData } from "@/types/attribution";

const firstTouchKey = "legal-leadgen:first-attribution";

function canUseStorage() { return typeof window !== "undefined"; }

export function getFirstTouchAttribution(): AttributionData {
  if (!canUseStorage()) return {};
  try { return JSON.parse(window.localStorage.getItem(firstTouchKey) ?? "{}") as AttributionData; } catch { return {}; }
}

export function saveFirstTouchAttribution(attribution: AttributionData): AttributionData {
  const firstTouch = getFirstTouchAttribution();
  if (Object.keys(firstTouch).length > 0 || Object.keys(attribution).length === 0 || !canUseStorage()) return firstTouch;
  window.localStorage.setItem(firstTouchKey, JSON.stringify(attribution));
  return attribution;
}
