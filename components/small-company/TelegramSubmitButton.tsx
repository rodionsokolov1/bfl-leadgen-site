"use client";

import { useRef, useState, type ReactNode } from "react";

import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics/events";
import { getMetrikaClientId } from "@/lib/analytics/metrika";
import { mergeFirstTouchAttribution } from "@/lib/attribution/storage";
import { assessmentAttributionFromContext, buildFunnelAssessmentPayload } from "@/lib/funnel/assessment";
import { submitFunnelAssessment } from "@/lib/funnel/submitAssessment";
import type { FunnelInput } from "@/types/funnel";

type SubmitState = "default" | "submitting" | "success" | "error";

type TelegramSubmitButtonProps = {
  children: ReactNode;
  className: string;
  disabled?: boolean;
  input: FunnelInput | null;
  source: "gate" | "final";
};

export function TelegramSubmitButton({ children, className, disabled = false, input, source }: TelegramSubmitButtonProps) {
  const [state, setState] = useState<SubmitState>("default");
  const [message, setMessage] = useState("");
  const submittingRef = useRef(false);

  async function handleSubmit() {
    if (!input || submittingRef.current) return;
    submittingRef.current = true;
    setState("submitting");
    setMessage("");
    try {
      const metrikaClientId = await getMetrikaClientId();
      if (metrikaClientId) mergeFirstTouchAttribution({ ym_client_id: metrikaClientId });
      const attributionContext = getAttribution();
      const attribution = assessmentAttributionFromContext(attributionContext);
      trackEvent("FUNNEL_TELEGRAM_CTA_CLICKED", { segment: "small_company", source });
      const payload = buildFunnelAssessmentPayload(input, attribution);
      const result = await submitFunnelAssessment(payload);
      if (!result.telegramUrl) throw new Error("Telegram URL is missing.");
      trackEvent("FUNNEL_TELEGRAM_CTA_CLICK", {
        segment: "small_company",
        source,
        overallDiagnosisType: payload.diagnosis.overallDiagnosisType,
        primaryBottleneck: payload.diagnosis.primaryBottleneck,
        costPerContract: payload.metrics.costPerContract ?? undefined,
        assessmentId: result.token,
        trackingId: attribution.trackingId,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
      });
      trackEvent("FUNNEL_ASSESSMENT_SAVED", { segment: "small_company", source, mocked: result.mocked });
      setState("success");
      window.location.assign(result.telegramUrl);
    } catch {
      submittingRef.current = false;
      setState("error");
      setMessage("Не удалось подготовить разбор. Попробуй ещё раз.");
    }
  }

  return (
    <div>
      <button className={className} type="button" disabled={disabled || !input || state === "submitting" || state === "success"} onClick={handleSubmit}>
        {state === "submitting" || state === "success" ? "Готовлю разбор…" : children}
      </button>
      {message ? <p aria-live="polite" role={state === "error" ? "alert" : "status"}>{message}</p> : null}
    </div>
  );
}
