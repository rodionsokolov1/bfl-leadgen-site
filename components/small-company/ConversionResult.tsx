"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";

import { SocialIcon } from "@/components/home/SocialIcon";
import { trackEvent } from "@/lib/analytics/events";
import { buildConversionResultModel, type ResultVisual } from "@/lib/funnel/conversionResult";
import type { FunnelInput, FunnelMetrics } from "@/types/funnel";
import type { FunnelStatuses } from "@/lib/funnel/diagnostics";

import { TelegramSubmitButton } from "./TelegramSubmitButton";
import styles from "./conversionResult.module.css";

function ResultSketch({ visual }: { visual: ResultVisual }) {
  const labels: Record<ResultVisual, string[]> = {
    lead_cost: ["оффер", "→", "посадочная", "→", "договор"],
    contact: ["заявка", "→", "звонок", "→", "разговор"],
    booking: ["разговор", "→", "встреча", "?"],
    show: ["назначили", "→", "пришёл"],
    close: ["встреча", "→", "договор"],
    scaling: ["GEO", "↗", "офферы", "↗", "объём"],
    multiple: ["заявка", "···", "встреча", "···", "договор"],
  };
  const note: Record<ResultVisual, string> = {
    lead_cost: "смотрим дальше CPL",
    contact: "первый звонок — 3–5 минут",
    booking: "не теряем обещание рекламы",
    show: "назначили → пришёл",
    close: "что происходит после встречи?",
    scaling: "здесь уже можно масштабировать",
    multiple: "смотрим всю цепочку",
  };
  return <div className={styles.sketch} data-visual={visual} aria-hidden="true"><div>{labels[visual].map((label, index) => <span key={label + index}>{label}</span>)}</div><p>{note[visual]}</p></div>;
}

export function ConversionResult({ input, metrics, statuses }: { input: FunnelInput; metrics: FunnelMetrics; statuses: FunnelStatuses }) {
  const model = useMemo(() => buildConversionResultModel(input, metrics, statuses), [input, metrics, statuses]);
  const trackedSignature = useRef("");

  useEffect(() => {
    const signature = [model.overallDiagnosisType, model.primaryBottleneck, metrics.costPerContract].join(":");
    if (trackedSignature.current === signature) return;
    trackedSignature.current = signature;
    trackEvent("FUNNEL_RESULT_VIEWED", {
      overallDiagnosisType: model.overallDiagnosisType,
      contractCostStatus: model.contractCostStatus ?? undefined,
      primaryBottleneck: model.primaryBottleneck,
      costPerContract: metrics.costPerContract ?? undefined,
    });
  }, [metrics.costPerContract, model]);

  return (
    <section className={styles.result} aria-labelledby="conversion-result-title">
      <div className={styles.resultMain}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>РЕЗУЛЬТАТ ДИАГНОСТИКИ</span>
          <h3 id="conversion-result-title">{model.title}</h3>
          <p className={styles.summary}>{model.summary}</p>
          <div className={styles.focus}>
            <span>{model.focusLabel}</span>
            <h4>{model.focusTitle}</h4>
            <p>{model.focusBody}</p>
            {model.focusDetail ? <small>{model.focusDetail}</small> : null}
          </div>
          <small className={styles.disclaimer}>Вывод построен по введённым цифрам и показывает, куда я бы смотрел в первую очередь.</small>
        </div>
        <ResultSketch visual={model.visual} />
      </div>
      <div className={styles.telegram}>
        <div className={styles.telegramContent}>
          <span className={styles.telegramLabel}>А ТЕПЕРЬ — ПОЛНЫЙ РАЗБОР</span>
          <h4>Отправь свою воронку в Telegram в 2 шага — и сразу получи полный разбор</h4>
          <div className={styles.telegramSteps}>
            <div><span>01</span><strong>Нажми кнопку и открой Telegram</strong></div>
            <i aria-hidden="true">→</i>
            <div><span>02</span><strong>Получи готовый разбор своей воронки</strong></div>
            <small>заново ничего вводить не нужно</small>
          </div>
          <p className={styles.benefitsTitle}>Что будет внутри:</p>
          <ul>{model.teaser.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className={styles.telegramAction}>
          <TelegramSubmitButton className={styles.telegramButton} input={input} source="gate">
            <span className={styles.buttonIcon}><SocialIcon name="telegram" /></span>
            <span className={styles.buttonLabel}>{model.ctaLabel}</span>
            <span className={styles.buttonArrow}>→</span>
          </TelegramSubmitButton>
          <small>Все данные отправятся автоматически. Ничего повторно заполнять не нужно — персональный результат придёт сразу.</small>
        </div>
        <div className={styles.telegramIllustration} aria-label={`Пример готового разбора: ${model.telegramReserve}`}>
          <Image src="/images/small-company/telegram-result-sketch-v2.png" alt="" fill sizes="(max-width: 900px) 100vw, 34vw" />
        </div>
      </div>
    </section>
  );
}
