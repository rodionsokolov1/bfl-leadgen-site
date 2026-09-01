"use client";

import type { FunnelInput } from "@/types/funnel";

import { TelegramSubmitButton } from "./TelegramSubmitButton";
import styles from "./gate.module.css";

const fullAnalysisItems = [
  "приоритетное узкое место",
  "что проверить первым",
  "какие показатели взаимосвязаны",
  "какой этап потенциально даёт наибольший эффект",
  "где реклама реально может быть проблемой",
  "где менять рекламу раньше времени не стоит",
  "рекомендации по введённым цифрам",
];

export function PartialAnalysisGate({ input }: { input: FunnelInput }) {
  return (
    <section className={styles.gate} aria-labelledby="full-analysis-title" id="telegram-analysis">
      <div className={styles.gateCopy}>
        <span className={styles.eyebrow}>БЕСПЛАТНО СРАЗУ</span>
        <h2 id="full-analysis-title">Твоя математика готова. Полный разбор — следующий шаг.</h2>
        <p>На сайте ты уже получил фактическую воронку, стоимости этапов, конверсии и безопасное наблюдение без выдуманных benchmark.</p>
        <h3>В полном разборе:</h3>
        <ul>{fullAnalysisItems.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className={styles.reportPreview} aria-label="Предпросмотр полного разбора">
        <div className={styles.previewVisible}>
          <span>ИНДИВИДУАЛЬНЫЙ РАЗБОР</span>
          <strong>Экономика воронки и порядок проверки этапов</strong>
          <p>Верхняя часть отчёта будет содержать твои фактические цифры и контекст диагностики: {input.leads} лидов → {input.contracts} договоров.</p>
        </div>
        <div className={styles.previewBlurred} aria-hidden="true">
          <div /><div /><div /><div />
        </div>
        <div className={styles.previewFade} />
      </div>
      <div className={styles.gateAction}>
        <TelegramSubmitButton className={styles.telegramButton} input={input} source="gate">Получить полный разбор в Telegram <span>→</span></TelegramSubmitButton>
        <p>Сразу после запуска бота я получу твою заполненную воронку и смогу разобрать именно твои цифры — повторно ничего вводить не придётся.</p>
      </div>
    </section>
  );
}
