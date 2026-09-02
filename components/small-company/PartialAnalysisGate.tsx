"use client";

import type { FunnelInput } from "@/types/funnel";

import { TelegramSubmitButton } from "./TelegramSubmitButton";
import styles from "./gate.module.css";

export function PartialAnalysisGate({ input }: { input: FunnelInput }) {
  return (
    <section className={styles.gate} aria-labelledby="full-analysis-title" id="telegram-analysis">
      <div className={styles.gateHeading}>
        <span className={styles.eyebrow}>ПОЛНЫЙ РАЗБОР</span>
        <h2 id="full-analysis-title">Это только малая часть того, что можно докрутить</h2>
        <p>Отправь данные воронки в Telegram-бот и сразу получи полный разбор со всеми наблюдениями и рекомендациями.</p>
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
