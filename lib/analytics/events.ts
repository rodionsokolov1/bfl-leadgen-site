import type { AnalyticsEventName, AnalyticsEventProperties } from "@/types/analytics";
import { reachMetrikaGoal } from "./metrika";

export function trackEvent(name: AnalyticsEventName, properties?: AnalyticsEventProperties) {
  reachMetrikaGoal(name, properties);
}
