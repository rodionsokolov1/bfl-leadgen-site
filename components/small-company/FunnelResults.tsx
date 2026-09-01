"use client";

import { useMemo, useRef, useState } from "react";

import { allGoodContent, benchmarkLabels, bottleneckContent } from "@/config/funnel";
import { trackEvent } from "@/lib/analytics/events";
import { calculateFunnel } from "@/lib/funnel/calculations";
import { findPrimaryBottleneck, getFunnelStatuses } from "@/lib/funnel/diagnostics";
import { calculateScenario, scenarioFromInput, type FunnelScenario } from "@/lib/funnel/scenario";
import type { FunnelInput, FunnelMetricKey, FunnelStatus } from "@/types/funnel";

import { PartialAnalysisGate } from "./PartialAnalysisGate";
import styles from "./results.module.css";

function money(value: number | null): string {
  return value === null ? "не рассчитывается" : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " ₽";
}

function number(value: number | null, digits = 1): string {
  return value === null ? "не рассчитывается" : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(value);
}

function percent(value: number | null): string {
  return value === null ? "не рассчитывается" : number(value * 100) + "%";
}

function StatusLabel({ metric, status }: { metric: FunnelMetricKey; status: FunnelStatus | null }) {
  if (!status) return <small className={styles.noStatus}>Статус не рассчитывается</small>;
  return <small className={styles.summaryStatus} data-status={status}>{benchmarkLabels[metric][status]}</small>;
}

type ScenarioKey = keyof FunnelScenario;

const scenarioControls: Array<{ key: ScenarioKey; label: string; kind: "money" | "rate" }> = [
  { key: "costPerLead", label: "Стоимость заявки", kind: "money" },
  { key: "contactRate", label: "Дозвон", kind: "rate" },
  { key: "bookingRate", label: "Назначение встречи", kind: "rate" },
  { key: "showRate", label: "Доходимость", kind: "rate" },
  { key: "closeRate", label: "Встреча → договор", kind: "rate" },
];

function Summary({ input }: { input: FunnelInput }) {
  const result = calculateFunnel(input);
  const statuses = getFunnelStatuses(input, result);
  const primary = findPrimaryBottleneck(input, result, statuses);
  const stages: Array<{ label: string; count: number; conversion: number | null; cost: number | null; metric: FunnelMetricKey }> = [
    { label: "Заявки", count: input.leadsCount, conversion: null, cost: input.costPerLead, metric: "costPerLead" },
    { label: "Состоявшиеся разговоры", count: input.contactedCount, conversion: result.contactRate, cost: result.costPerContact, metric: "contactRate" },
    { label: "Назначенные встречи", count: input.meetingsBooked, conversion: result.bookingRate, cost: result.costPerBookedMeeting, metric: "bookingRate" },
    { label: "Состоявшиеся встречи", count: input.meetingsHeld, conversion: result.showRate, cost: result.costPerHeldMeeting, metric: "showRate" },
    { label: "Договоры", count: input.contractsCount, conversion: result.closeRate, cost: result.costPerContract, metric: "closeRate" },
  ];
  const diagnosis = primary === "none" ? allGoodContent : bottleneckContent[primary];
  const recommendation = primary === "none" ? null : bottleneckContent[primary].recommendation;

  return (
    <section className={styles.summary} aria-labelledby="funnel-summary-title">
      <span className={styles.eyebrow}>ТВОЯ ПОЛНАЯ ВОРОНКА</span>
      <h2 id="funnel-summary-title">Вот как выглядит экономика за последний полный месяц</h2>
      <p className={styles.budget}>Рекламный бюджет — <strong>{money(result.adSpend)}</strong></p>
      <div className={styles.stageList}>
        {stages.map((stage, index) => (
          <div className={styles.summaryStage} key={stage.label}>
            <div><span>{stage.label}</span><strong>{number(stage.count, 0)}</strong></div>
            <dl>
              {index > 0 ? <div><dt>Конверсия</dt><dd>{percent(stage.conversion)}</dd></div> : null}
              <div><dt>{index === 4 ? "Стоимость договора" : "Стоимость этапа"}</dt><dd>{money(stage.cost)}</dd></div>
            </dl>
            <StatusLabel metric={stage.metric} status={statuses[stage.metric]} />
          </div>
        ))}
      </div>
      <p className={styles.leadsPerContract}>На один договор приходится ≈ <strong>{number(result.leadsPerContract)} заявок</strong>. Этот показатель и стоимость договора показываются без benchmark-оценки.</p>
      <section className={styles.bottleneck} aria-labelledby="bottleneck-title">
        <span>ГЛАВНОЕ НАБЛЮДЕНИЕ</span>
        <h3 id="bottleneck-title">{diagnosis.title}</h3>
        <p>{diagnosis.body}</p>
        {recommendation ? <strong>{recommendation}</strong> : null}
        {primary === "none" ? <a className={styles.resultLink} href="#telegram-analysis">Отправить воронку на разбор →</a> : null}
        <small>Это математическая диагностика по введённым цифрам, а не утверждение о причинности.</small>
      </section>
    </section>
  );
}

function WhatIfSimulator({ input }: { input: FunnelInput }) {
  const factualScenario = useMemo(() => scenarioFromInput(input), [input]);
  const [scenario, setScenario] = useState<FunnelScenario>(factualScenario);
  const whatIfTracked = useRef(false);
  const current = calculateScenario(input, factualScenario);
  const changed = calculateScenario(input, scenario);
  const costMin = Math.max(1, Math.floor(input.costPerLead * .25));
  const costMax = Math.max(costMin + 1, Math.ceil(input.costPerLead * 2));
  const contractsDelta = changed.contracts - current.contracts;
  const costDelta = current.costPerContract !== null && changed.costPerContract !== null
    ? changed.costPerContract - current.costPerContract
    : null;

  function update(key: ScenarioKey, displayValue: number, kind: "money" | "rate") {
    if (!Number.isFinite(displayValue)) return;
    const value = kind === "rate" ? displayValue / 100 : displayValue;
    setScenario((currentScenario) => ({ ...currentScenario, [key]: value }));
    if (!whatIfTracked.current) {
      whatIfTracked.current = true;
      trackEvent("FUNNEL_WHAT_IF_USED", { segment: "small_company" });
    }
  }

  return (
    <section className={styles.whatIf} aria-labelledby="what-if-title">
      <div className={styles.whatIfHeading}>
        <span className={styles.handLabel}>Что если?</span>
        <h2 id="what-if-title">А теперь немного поиграй с цифрами</h2>
        <p>Посмотри, что сильнее изменит стоимость договора именно в твоей воронке.</p>
      </div>
      <div className={styles.controlList}>
        {scenarioControls.map(({ key, kind, label }) => {
          const displayValue = kind === "rate" ? scenario[key] * 100 : scenario[key];
          const min = kind === "rate" ? 0 : costMin;
          const max = kind === "rate" ? 100 : costMax;
          return (
            <label className={styles.scenarioControl} key={key}>
              <span>{label}</span>
              <input aria-label={label + ", ползунок"} type="range" min={min} max={max} step={kind === "rate" ? .1 : 1} value={displayValue} onChange={(event) => update(key, Number(event.target.value), kind)} />
              <span className={styles.scenarioNumber}><input aria-label={label + ", точное значение"} type="number" min={min} max={max} step={kind === "rate" ? .1 : 1} value={Number(displayValue.toFixed(1))} onChange={(event) => update(key, Number(event.target.value), kind)} />{kind === "rate" ? "%" : "₽"}</span>
            </label>
          );
        })}
      </div>
      <div className={styles.comparison}>
        <article><span>СЕЙЧАС</span><dl><div><dt>Договоров</dt><dd>{number(current.contracts)}</dd></div><div><dt>Стоимость договора</dt><dd>{money(current.costPerContract)}</dd></div></dl></article>
        <span className={styles.compareArrow} aria-hidden="true">→</span>
        <article><span>СЦЕНАРИЙ</span><dl><div><dt>Договоров</dt><dd>≈ {number(changed.contracts)}</dd></div><div><dt>Стоимость договора</dt><dd>≈ {money(changed.costPerContract)}</dd></div></dl></article>
      </div>
      <dl className={styles.deltaList} aria-live="polite">
        <div><dt>Изменение в договорах</dt><dd>{contractsDelta >= 0 ? "+" : "−"}{number(Math.abs(contractsDelta))}</dd></div>
        <div><dt>Изменение стоимости договора</dt><dd>{costDelta === null ? "не рассчитывается" : (costDelta > 0 ? "+" : "−") + money(Math.abs(costDelta))}</dd></div>
      </dl>
      <p className={styles.modelDisclaimer}>Это математическая модель по твоим цифрам, а не гарантия результата.</p>
    </section>
  );
}

export function FunnelResults({ input }: { input: FunnelInput }) {
  const scenarioKey = [input.leadsCount, input.costPerLead, input.contactedCount, input.meetingsBooked, input.meetingsHeld, input.contractsCount].join(":");
  return <div className={styles.results} id="funnel-results"><Summary input={input} /><WhatIfSimulator input={input} key={scenarioKey} /><PartialAnalysisGate input={input} /></div>;
}
