"use client";

import { useMemo, useRef, useState } from "react";

import { allGoodContent, benchmarkLabels, bottleneckContent } from "@/config/funnel";
import { trackEvent } from "@/lib/analytics/events";
import { calculateFunnel } from "@/lib/funnel/calculations";
import { diagnoseMetric, findPrimaryBottleneck, getDynamicConversionTargets, getFunnelConclusion, getFunnelStatuses } from "@/lib/funnel/diagnostics";
import { calculateScenario, scenarioFromInput, type FunnelScenario, type ScenarioResult } from "@/lib/funnel/scenario";
import type { FunnelInput, FunnelLocalMetricKey, FunnelMetricKey, FunnelStatus } from "@/types/funnel";

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
  if (!status) return null;
  return <small className={styles.summaryStatus} data-status={status}>{benchmarkLabels[metric][status]}</small>;
}

type ScenarioKey = keyof FunnelScenario;

const scenarioControls: Array<{ key: FunnelLocalMetricKey; label: string; kind: "money" | "rate" }> = [
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
  const stages: Array<{ label: string; count: number; conversion: number | null; cost: number | null; conversionMetric: FunnelMetricKey | null; costMetric: FunnelMetricKey | null }> = [
    { label: "Заявки", count: input.leadsCount, conversion: null, cost: input.costPerLead, conversionMetric: null, costMetric: "costPerLead" },
    { label: "Состоявшиеся разговоры", count: input.contactedCount, conversion: result.contactRate, cost: result.costPerContact, conversionMetric: "contactRate", costMetric: null },
    { label: "Назначенные встречи", count: input.meetingsBooked, conversion: result.bookingRate, cost: result.costPerBookedMeeting, conversionMetric: "bookingRate", costMetric: "costPerBookedMeeting" },
    { label: "Состоявшиеся встречи", count: input.meetingsHeld, conversion: result.showRate, cost: result.costPerHeldMeeting, conversionMetric: "showRate", costMetric: "costPerHeldMeeting" },
    { label: "Договоры", count: input.contractsCount, conversion: result.closeRate, cost: result.costPerContract, conversionMetric: "closeRate", costMetric: "costPerContract" },
  ];
  const diagnosis = primary === "none" ? allGoodContent : bottleneckContent[primary];
  const recommendation = primary === "none" ? null : bottleneckContent[primary].recommendation;
  const conclusion = getFunnelConclusion(statuses, primary);
  const dynamicTargets = getDynamicConversionTargets(primary, result, statuses);
  const primaryRate = primary === "booking_rate" ? result.bookingRate : primary === "show_rate" ? result.showRate : primary === "close_rate" ? result.closeRate : null;
  const primaryRateLabel = primary === "booking_rate" ? "конверсия разговора во встречу" : primary === "show_rate" ? "доходимость" : "конверсия встречи в договор";
  const targetStageLabel = primary === "booking_rate" ? "назначенная встреча" : primary === "show_rate" ? "состоявшаяся встреча" : "договор";

  return (
    <section className={styles.summary} aria-labelledby="funnel-summary-title">
      <span className={styles.eyebrow}>ТВОЯ ПОЛНАЯ ВОРОНКА</span>
      <h2 id="funnel-summary-title">Вот как выглядит экономика за последний полный месяц</h2>
      <p className={styles.budget}>Рекламный бюджет — <strong>{money(result.adSpend)}</strong></p>
      <div className={styles.stageList}>
        {stages.map((stage, index) => {
          const conversionStatus = stage.conversionMetric ? statuses[stage.conversionMetric] : null;
          const costStatus = stage.costMetric ? statuses[stage.costMetric] : null;
          return (
          <div className={styles.summaryStage} data-status={costStatus ?? conversionStatus ?? undefined} key={stage.label}>
            <div><span>{stage.label}</span><strong>{number(stage.count, 0)}</strong></div>
            <dl>
              {stage.conversionMetric ? <div><dt>Конверсия</dt><dd><span>{percent(stage.conversion)}</span><StatusLabel metric={stage.conversionMetric} status={conversionStatus} /></dd></div> : null}
              <div><dt>{index === 4 ? "Стоимость договора" : "Стоимость этапа"}</dt><dd><span>{money(stage.cost)}</span>{stage.costMetric ? <StatusLabel metric={stage.costMetric} status={costStatus} /> : null}</dd></div>
            </dl>
          </div>
          );
        })}
      </div>
      <p className={styles.leadsPerContract}>На один договор приходится ≈ <strong>{number(result.leadsPerContract)} заявок</strong>.</p>
      <section className={styles.bottleneck} aria-labelledby="bottleneck-title">
        <span>ГЛАВНОЕ НАБЛЮДЕНИЕ</span>
        <h3 id="bottleneck-title">{conclusion.title}</h3>
        {conclusion.kind === "economy_mismatch" ? (
          <>
            <p>Здесь нет одного этапа, где всё полностью разваливается. Проблема накапливается постепенно.</p>
            <p>Назначенная встреча обходится примерно в <strong>{money(result.costPerBookedMeeting)}</strong>, а при доходимости {percent(result.showRate)} стоимость состоявшейся встречи вырастает уже до <strong>{money(result.costPerHeldMeeting)}</strong>.</p>
            <p>Даже при хорошей конверсии встречи в договор — {percent(result.closeRate)} — итоговая стоимость договора получается около <strong>{money(result.costPerContract)}</strong>.</p>
          </>
        ) : conclusion.kind === "economy_attention" ? (
          <>
            <p>Итоговая стоимость договора — <strong>{money(result.costPerContract)}</strong>. Локальные конверсии и стоимость этапов нужно рассматривать вместе.</p>
            <p>{diagnosis.body}</p>
          </>
        ) : <p>{diagnosis.body}</p>}
        {primary !== "none" ? <p className={styles.primaryFocus}><strong>Где я бы смотрел в первую очередь</strong><span>{bottleneckContent[primary].title}</span></p> : null}
        {recommendation ? <strong>{recommendation}</strong> : null}
        {dynamicTargets.length > 0 && primaryRate !== null ? (
          <div className={styles.dynamicTargets}>
            <p>Сейчас {primaryRateLabel} — <strong>{percent(primaryRate)}</strong>.</p>
            {dynamicTargets.map((target) => target.achievable && target.requiredRate !== null ? (
              <p key={target.targetCost}>При текущей стоимости предыдущего этапа, чтобы стоимость этапа «{targetStageLabel}» была не выше <strong>{money(target.targetCost)}</strong>, нужна {primaryRateLabel} примерно <strong>{percent(target.requiredRate)}</strong>.</p>
            ) : (
              <p key={target.targetCost}>При текущей стоимости предыдущего этапа цель до <strong>{money(target.targetCost)}</strong> недостижима только за счёт улучшения текущей конверсии — даже при 100%.</p>
            ))}
          </div>
        ) : null}
        {primary === "none" ? <a className={styles.resultLink} href="#telegram-analysis">Отправить воронку на разбор →</a> : null}
        <small>Это математическая диагностика по введённым цифрам, а не утверждение о причинности.</small>
      </section>
      <PartialAnalysisGate input={input} />
    </section>
  );
}

function ScenarioEconomy({ approximate, result, title }: { approximate?: boolean; result: ScenarioResult; title: string }) {
  const rows: Array<{ label: string; value: number | null; metric: FunnelMetricKey | null }> = [
    { label: "Стоимость разговора", value: result.costPerContact, metric: null },
    { label: "Стоимость назначенной встречи", value: result.costPerBookedMeeting, metric: "costPerBookedMeeting" },
    { label: "Стоимость состоявшейся встречи", value: result.costPerHeldMeeting, metric: "costPerHeldMeeting" },
    { label: "Стоимость договора", value: result.costPerContract, metric: "costPerContract" },
  ];
  return (
    <article>
      <span>{title}</span>
      <dl>
        <div><dt>Договоров</dt><dd>{approximate ? "≈ " : ""}{number(result.contracts)}</dd></div>
        {rows.map((row) => {
          const status = row.metric ? diagnoseMetric(row.value, row.metric) : null;
          return <div key={row.label}><dt>{row.label}</dt><dd>{approximate ? "≈ " : ""}{money(row.value)}{row.metric ? <StatusLabel metric={row.metric} status={status} /> : null}</dd></div>;
        })}
      </dl>
    </article>
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
          const status = diagnoseMetric(scenario[key], key);
          const min = kind === "rate" ? 0 : costMin;
          const max = kind === "rate" ? 100 : costMax;
          return (
            <label className={styles.scenarioControl} key={key}>
              <span className={styles.scenarioLabel}>{label}<StatusLabel metric={key} status={status} /></span>
              <input aria-label={label + ", ползунок"} type="range" min={min} max={max} step={kind === "rate" ? .1 : 1} value={displayValue} onChange={(event) => update(key, Number(event.target.value), kind)} />
              <span className={styles.scenarioNumber}><input aria-label={label + ", точное значение"} type="number" min={min} max={max} step={kind === "rate" ? .1 : 1} value={Number(displayValue.toFixed(1))} onChange={(event) => update(key, Number(event.target.value), kind)} />{kind === "rate" ? "%" : "₽"}</span>
            </label>
          );
        })}
      </div>
      <div className={styles.comparison}>
        <ScenarioEconomy result={current} title="СЕЙЧАС" />
        <span className={styles.compareArrow} aria-hidden="true">→</span>
        <ScenarioEconomy approximate result={changed} title="СЦЕНАРИЙ" />
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
  return <div className={styles.results} id="funnel-results"><Summary input={input} /><WhatIfSimulator input={input} key={scenarioKey} /></div>;
}
