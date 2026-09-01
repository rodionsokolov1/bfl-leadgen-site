"use client";

import { allGoodContent, bottleneckContent } from "@/config/funnel";
import { calculateFunnel } from "@/lib/funnel/calculations";
import { findPrimaryBottleneck, getFunnelStatuses } from "@/lib/funnel/diagnostics";
import type { FunnelInput } from "@/types/funnel";

import { TelegramSubmitButton } from "./TelegramSubmitButton";
import styles from "./gate.module.css";

export function PartialAnalysisGate({ input }: { input: FunnelInput }) {
  const metrics = calculateFunnel(input);
  const primary = findPrimaryBottleneck(input, metrics, getFunnelStatuses(input, metrics));
  const visibleLead = primary === "none" ? allGoodContent.title : bottleneckContent[primary].title;

  return (
    <section className={styles.gate} aria-labelledby="full-analysis-title" id="telegram-analysis">
      <div className={styles.gateHeading}>
        <span className={styles.eyebrow}>ПОЛНЫЙ РАЗБОР</span>
        <h2 id="full-analysis-title">Я нашёл ещё несколько вещей, которые стоит проверить</h2>
      </div>
      <div className={styles.teaserGrid} aria-label="Содержание полного разбора">
        <article>
          <span>01 — Главное слабое место</span>
          <strong>{visibleLead}</strong>
        </article>
        <article className={styles.lockedCard}>
          <span>02 — Что ещё влияет на результат</span>
          <div aria-hidden="true"><i /><i /><i /></div>
        </article>
        <article className={styles.lockedCard}>
          <span>03 — Что бы я проверил в первую очередь</span>
          <div aria-hidden="true"><i /><i /><i /></div>
        </article>
        <article className={styles.lockedCard}>
          <span>04 — Какой сценарий даст больший эффект</span>
          <div aria-hidden="true"><i /><i /><i /></div>
        </article>
      </div>
      <div className={styles.gateAction}>
        <TelegramSubmitButton className={styles.telegramButton} input={input} source="gate">
          Получить полный разбор моей воронки в Telegram <span>→</span>
        </TelegramSubmitButton>
        <div>
          <p><strong>Все данные отправятся автоматически. Ничего повторно заполнять не нужно.</strong></p>
          <p><strong>Персональный результат придёт сразу — ждать не придётся.</strong></p>
        </div>
      </div>
    </section>
  );
}
