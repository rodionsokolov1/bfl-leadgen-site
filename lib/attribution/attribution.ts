import type { AttributionData } from "@/types/attribution";
import { readAttributionParams } from "./params";
import { getFirstTouchAttribution, saveFirstTouchAttribution } from "./storage";

export type AttributionContext = { current: AttributionData; firstTouch: AttributionData };

export function initializeAttribution(search = typeof window === "undefined" ? "" : window.location.search): AttributionContext {
  const current = readAttributionParams(search);
  return { current, firstTouch: saveFirstTouchAttribution(current) };
}

export function getAttribution(): AttributionContext {
  const current = typeof window === "undefined" ? {} : readAttributionParams(window.location.search);
  return { current, firstTouch: getFirstTouchAttribution() };
}
