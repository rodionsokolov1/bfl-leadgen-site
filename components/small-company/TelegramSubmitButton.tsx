"use client";

import { useState, type ReactNode } from "react";

import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics/events";
import { assessmentTrackingFromAttribution, buildFunnelAssessmentPayload } from "@/lib/funnel/assessment";
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

  async function handleSubmit() {
    if (!input || state === "submitting") return;
    setState("submitting");
    setMessage("");
    trackEvent("SMALL_TELEGRAM_ANALYSIS_CLICK", { segment: "small_company", source });
    try {
      const payload = buildFunnelAssessmentPayload(input, assessmentTrackingFromAttribution(getAttribution()));
      const result = await submitFunnelAssessment(payload);
      trackEvent("SMALL_TELEGRAM_ASSESSMENT_SENT", { segment: "small_company", source, mocked: result.mocked });
      setState("success");
      if (result.telegramUrl) {
        setMessage(result.mocked ? "Dev mock сохранён. Открываю Telegram…" : "Воронка сохранена. Открываю Telegram…");
        window.location.assign(result.telegramUrl);
      } else {
        setMessage("Dev mock сохранён. Добавь NEXT_PUBLIC_TELEGRAM_BOT_USERNAME, чтобы включить переход в Telegram.");
      }
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Не удалось отправить воронку. Попробуй ещё раз.");
    }
  }

  return (
    <div>
      <button className={className} type="button" disabled={disabled || !input || state === "submitting"} onClick={handleSubmit}>
        {state === "submitting" ? "Сохраняю воронку…" : children}
      </button>
      {message ? <p aria-live="polite" role={state === "error" ? "alert" : "status"}>{message}</p> : null}
    </div>
  );
}
