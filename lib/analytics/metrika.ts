import type { AnalyticsEventProperties } from "@/types/analytics";

type MetrikaFunction = {
  (id: number, action: "reachGoal", goal: string, params?: AnalyticsEventProperties): void;
  (id: number, action: "getClientID", callback: (clientId: string) => void): void;
  (id: number, action: "init", options: Record<string, unknown>): void;
  (...args: unknown[]): void;
  a?: number;
  l?: unknown[];
};

declare global {
  interface Window {
    ym?: MetrikaFunction;
    __bflMetrikaInitialized?: Record<number, boolean>;
  }
}

export function getMetrikaCounterId(): number | null {
  const counterId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
  return Number.isFinite(counterId) && counterId > 0 ? counterId : null;
}

export function reachMetrikaGoal(goal: string, properties?: AnalyticsEventProperties) {
  if (typeof window === "undefined") return;
  const counterId = getMetrikaCounterId();
  if (counterId) window.ym?.(counterId, "reachGoal", goal, properties);
}

export function getMetrikaClientId(timeoutMs = 1500): Promise<string | undefined> {
  if (typeof window === "undefined") return Promise.resolve(undefined);
  const counterId = getMetrikaCounterId();
  if (!counterId || !window.ym) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (clientId?: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(clientId && /^\d+$/.test(clientId) ? clientId : undefined);
    };
    const timer = window.setTimeout(() => finish(), timeoutMs);
    window.ym?.(counterId, "getClientID", finish);
  });
}
