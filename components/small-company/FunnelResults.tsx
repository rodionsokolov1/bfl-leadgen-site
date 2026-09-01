"use client";

import { useMemo, useRef, useState } from "react";

import { funnelThresholds } from "@/config/funnel";
import { calculateFunnel } from "@/lib/funnel/calculations";
import { diagnoseMetric } from "@/lib/funnel/diagnostics";
import { trackEvent } from "@/lib/analytics/events";
import { calculateScenario, scenarioFromInput, type FunnelScenario } from "@/lib/funnel/scenario";
import type { FunnelInput } from "@/types/funnel";

import { PartialAnalysisGate } from "./PartialAnalysisGate";
import styles from "./results.module.css";

function money(value: number | null): string {
  return value === null ? "—" : `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;
}

function number(value: number | null, digits = 1): string {
  return value === null ? "—" : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(value);
}

function percent(value: number | null): string {
  return value === null ? "—" : `${number(value * 100)}%`;
}

type ScenarioKey = keyof FunnelScenario;

const scenarioControls: Array<{ key: ScenarioKey; label: string; kind: "money" | "rate" }> = [
  { key: "avgCpl", label: "CPL", kind: "money" },
  { key: "contactRate", label: "% дозвона", kind: "rate" },
  { key: "appointmentRate", label: "% назначения встречи", kind: "rate" },
  { key: "showRate", label: "% доходимости", kind: "rate" },
  { key: "closeRate", label: "% встречи → договор", kind: "rate" },
];

function Summary({ input }: { input: FunnelInput }) {
  const result = calculateFunnel(input);
  const stages = [
    { label: "Лидов", count: input.leads, conversion: null },
    { label: "Дозвонов", count: input.contacted, conversion: result.contactRate },
    { label: "Назначенных встреч", count: input.appointments, conversion: result.appointmentRate },
    { label: "Состоявшихся встреч", count: input.heldMeetings, conversion: result.showRate },
    { label: "Договоров", count: input.contracts, conversion: result.closeRate },
  ];
  const costs = [
    ["CPL", money(input.avgCpl)],
    ["Стоимость дозвона", money(result.costPerContact)],
    ["Стоимость назначенной встречи", money(result.costPerAppointment)],
    ["Стоимость состоявшейся встречи", money(result.costPerHeldMeeting)],
    ["Стоимость договора", money(result.costPerContract)],
    ["Лидов на 1 договор", number(result.leadsPerContract)],
  ];
  const cplNeedsAttention = diagnoseMetric(input.avgCpl, funnelThresholds.cpl) === "bad";

  return (
    <section className={styles.summary} aria-labelledby="funnel-summary-title">
      <span className={styles.eyebrow}>ВОТ ТВОЯ РЕАЛЬНАЯ ЭКОНОМИКА</span>
      <h2 id="funnel-summary-title">И только теперь можно нормально обсуждать: «лиды говно» или нет.</h2>
      <div className={styles.summaryGrid}>
        <div className={styles.stageList}>
          {stages.map((stage, index) => (
            <div className={styles.summaryStage} key={stage.label}>
              <span>{stage.label}</span><strong>{number(stage.count)}</strong>{index > 0 ? <small>{percent(stage.conversion)}</small> : null}
            </div>
          ))}
        </div>
        <dl className={styles.costList}>
          {costs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </div>
      <div className={styles.observation}>
        <strong>Главное наблюдение без домыслов</strong>
        <p>{cplNeedsAttention ? "CPL выше 3 000 ₽ — рекламу, оффер, посадочную и аудитории стоит отдельно проверить. Но одной этой цифры недостаточно, чтобы назвать рекламу плохой." : "Мы посчитали твою экономику. Для полноценной оценки показателей я сравню этапы в индивидуальном разборе."}</p>
      </div>
    </section>
  );
}

function WhatIfSimulator({ input }: { input: FunnelInput }) {
  const factualScenario = useMemo(() => scenarioFromInput(input), [input]);
  const [scenario, setScenario] = useState<FunnelScenario>(factualScenario);
  const whatIfTracked = useRef(false);

  const current = calculateScenario(input, factualScenario);
  const changed = calculateScenario(input, scenario);
  const cplMin = Math.max(1, Math.floor(input.avgCpl * .25));
  const cplMax = Math.max(cplMin + 1, Math.ceil(input.avgCpl * 2));
  const contractsDelta = changed.contracts - current.contracts;
  const costDelta = current.costPerContract && changed.costPerContract
    ? ((current.costPerContract - changed.costPerContract) / current.costPerContract) * 100
    : null;
  const changedLabels = scenarioControls.filter(({ key }) => Math.abs(scenario[key] - factualScenario[key]) > .00001).map(({ label }) => label);

  function update(key: ScenarioKey, displayValue: number, kind: "money" | "rate") {
    const value = kind === "rate" ? displayValue / 100 : displayValue;
    setScenario((currentScenario) => ({ ...currentScenario, [key]: value }));
    if (!whatIfTracked.current) {
      whatIfTracked.current = true;
      trackEvent("SMALL_WHATIF_USED", { segment: "small_company" });
    }
  }

  return (
    <section className={styles.whatIf} aria-labelledby="what-if-title">
      <div className={styles.whatIfHeading}>
        <span className={styles.handLabel}>Что если?</span>
        <h2 id="what-if-title">Посмотри, как меняется результат при тех же рекламных расходах</h2>
        <p>Все значения уже подставлены из твоей фактической воронки. Меняй только то, что хочешь проверить.</p>
      </div>
      <div className={styles.controlList}>
        {scenarioControls.map(({ key, kind, label }) => {
          const displayValue = kind === "rate" ? scenario[key] * 100 : scenario[key];
          const min = kind === "rate" ? 0 : cplMin;
          const max = kind === "rate" ? 100 : cplMax;
          return (
            <label className={styles.scenarioControl} key={key}>
              <span>{label}</span>
              <input type="range" min={min} max={max} step={kind === "rate" ? .1 : 1} value={displayValue} onChange={(event) => update(key, Number(event.target.value), kind)} />
              <span className={styles.scenarioNumber}><input aria-label={`${label}, точное значение`} type="number" min={min} max={max} step={kind === "rate" ? .1 : 1} value={Number(displayValue.toFixed(1))} onChange={(event) => update(key, Number(event.target.value), kind)} />{kind === "rate" ? "%" : "₽"}</span>
            </label>
          );
        })}
      </div>
      <div className={styles.comparison}>
        <article><span>СЕЙЧАС</span><dl><div><dt>Договоров</dt><dd>{number(current.contracts)}</dd></div><div><dt>Стоимость договора</dt><dd>{money(current.costPerContract)}</dd></div><div><dt>Лидов</dt><dd>{number(current.leads)}</dd></div></dl></article>
        <span className={styles.compareArrow} aria-hidden="true">→</span>
        <article><span>ЧТО ЕСЛИ</span><dl><div><dt>Договоров</dt><dd>≈ {number(changed.contracts)}</dd></div><div><dt>Стоимость договора</dt><dd>≈ {money(changed.costPerContract)}</dd></div><div><dt>Лидов</dt><dd>≈ {number(changed.leads)}</dd></div></dl></article>
      </div>
      <div className={styles.scenarioInsight} aria-live="polite">
        {changedLabels.length === 0 ? (
          <p>Сейчас оба сценария совпадают. Измени один или несколько показателей выше.</p>
        ) : (
          <p><strong>При тех же расходах изменение {changedLabels.length === 1 ? changedLabels[0] : "выбранных показателей"}</strong> математически даёт {contractsDelta >= 0 ? `потенциал примерно +${number(contractsDelta)} договоров` : `примерно ${number(Math.abs(contractsDelta))} договора меньше`}{costDelta !== null && costDelta > 0 ? ` и снижает расчётную стоимость договора на ${number(costDelta)}%` : ""}.</p>
        )}
        <small>Это математическая модель по введённым тобой данным, а не обещание или гарантия результата.</small>
      </div>
    </section>
  );
}

export function FunnelResults({ input }: { input: FunnelInput }) {
  const scenarioKey = `${input.leads}:${input.avgCpl}:${input.contacted}:${input.appointments}:${input.heldMeetings}:${input.contracts}`;
  return <div className={styles.results} id="funnel-results"><Summary input={input} /><WhatIfSimulator input={input} key={scenarioKey} /><PartialAnalysisGate input={input} /></div>;
}
