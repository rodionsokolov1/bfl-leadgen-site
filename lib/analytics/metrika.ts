import type { AnalyticsEventProperties } from "@/types/analytics";

declare global { interface Window { ym?: (id: number, action: "reachGoal", goal: string, params?: AnalyticsEventProperties) => void; } }

export function reachMetrikaGoal(goal: string, properties?: AnalyticsEventProperties) {
  if (typeof window === "undefined") return;
  const counterId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
  if (Number.isFinite(counterId) && counterId > 0) window.ym?.(counterId, "reachGoal", goal, properties);
}
