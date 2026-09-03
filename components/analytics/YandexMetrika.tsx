"use client";

import { useEffect } from "react";

import { getMetrikaClientId, getMetrikaCounterId } from "@/lib/analytics/metrika";
import { mergeFirstTouchAttribution } from "@/lib/attribution/storage";

function initializeCounter() {
  const counterId = getMetrikaCounterId();
  if (!counterId || typeof window === "undefined") return;

  window.__bflMetrikaInitialized = window.__bflMetrikaInitialized ?? {};
  if (window.__bflMetrikaInitialized[counterId]) {
    void getMetrikaClientId().then((clientId) => {
      if (clientId) mergeFirstTouchAttribution({ ym_client_id: clientId });
    });
    return;
  }
  window.__bflMetrikaInitialized[counterId] = true;

  if (!window.ym) {
    const queuedMetrika = ((...args: unknown[]) => {
      queuedMetrika.l = queuedMetrika.l ?? [];
      queuedMetrika.l.push(args);
    }) as NonNullable<Window["ym"]>;
    queuedMetrika.a = Date.now();
    window.ym = queuedMetrika;
  }

  window.ym(counterId, "init", { clickmap: false, trackLinks: false, accurateTrackBounce: false, webvisor: false });
  window.ym(counterId, "getClientID", (clientId) => {
    if (/^\d+$/.test(clientId)) mergeFirstTouchAttribution({ ym_client_id: clientId });
  });
}

export function YandexMetrika() {
  const counterId = getMetrikaCounterId();
  useEffect(() => {
    if (!counterId) return;
    initializeCounter();
    if (document.querySelector('script[data-yandex-metrika="true"]')) return;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.yandexMetrika = "true";
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.append(script);
  }, [counterId]);

  return null;
}
