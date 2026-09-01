"use client";

import { useEffect, useState } from "react";

import type { FunnelInput } from "@/types/funnel";

import { TelegramSubmitButton } from "./TelegramSubmitButton";
import styles from "./finalCta.module.css";

const storageKey = "small-company:funnel:v2";

type FunnelStateDetail = { completedSteps: number; input: FunnelInput; isValid: boolean };

function inputFromStoredState(): FunnelStateDetail | null {
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { completedSteps?: number; isValid?: boolean; values?: Record<string, string> };
    if (!parsed.values) return null;
    return {
      completedSteps: parsed.completedSteps ?? 0,
      isValid: Boolean(parsed.isValid),
      input: {
        leadsCount: Number(parsed.values.leadsCount) || 0,
        costPerLead: Number(parsed.values.costPerLead) || 0,
        contactedCount: Number(parsed.values.contactedCount) || 0,
        meetingsBooked: Number(parsed.values.meetingsBooked) || 0,
        meetingsHeld: Number(parsed.values.meetingsHeld) || 0,
        contractsCount: Number(parsed.values.contractsCount) || 0,
      },
    };
  } catch {
    return null;
  }
}

export function FinalTelegramCTA() {
  const [funnelState, setFunnelState] = useState<FunnelStateDetail | null>(null);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => setFunnelState(inputFromStoredState()), 0);
    const handleState = (event: Event) => setFunnelState((event as CustomEvent<FunnelStateDetail>).detail);
    window.addEventListener("small-funnel-state", handleState);
    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener("small-funnel-state", handleState);
    };
  }, []);

  const completed = funnelState?.completedSteps === 5 && funnelState.isValid;
  return (
    <section className={styles.finalCta} aria-labelledby="final-telegram-title">
      <div className={styles.frame}>
        <span className={styles.handArrow} aria-hidden="true">↘</span>
        <h2 id="final-telegram-title">Если хочешь — теперь можем разобрать уже не калькулятор, а твою реальную ситуацию</h2>
        <p>Перейди в Telegram-бота и отправь результаты своей воронки.</p>
        <p>Я посмотрю: <strong>что происходит с рекламой → где появляются основные потери → что я бы проверил в первую очередь.</strong></p>
        <p>И если увижу, что реально могу помочь — предложу формат тестовой работы.</p>
        <blockquote>Если проблема не в рекламе — я не буду продавать тебе новую рекламу.</blockquote>
        <TelegramSubmitButton className={styles.button} disabled={!completed} input={completed ? funnelState.input : null} source="final">
          Получить индивидуальный разбор в Telegram <span>→</span>
        </TelegramSubmitButton>
        <small>{completed ? "+ попадёшь в мой Telegram-прогрев с материалами по рекламе и экономике БФЛ." : "Сначала заполни 5 шагов воронки выше — повторно вводить цифры не придётся."}</small>
      </div>
    </section>
  );
}
