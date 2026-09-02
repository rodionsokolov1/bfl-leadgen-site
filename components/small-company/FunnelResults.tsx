"use client";

import { benchmarkLabels } from "@/config/funnel";
import { calculateFunnel } from "@/lib/funnel/calculations";
import { getFunnelStatuses } from "@/lib/funnel/diagnostics";
import type { FunnelInput, FunnelMetricKey, FunnelStatus } from "@/types/funnel";

import { ConversionResult } from "./ConversionResult";
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

function Summary({ input }: { input: FunnelInput }) {
  const result = calculateFunnel(input);
  const statuses = getFunnelStatuses(input, result);
  const stages: Array<{ label: string; count: number; conversion: number | null; cost: number | null; conversionMetric: FunnelMetricKey | null; costMetric: FunnelMetricKey | null }> = [
    { label: "Заявки", count: input.leadsCount, conversion: null, cost: input.costPerLead, conversionMetric: null, costMetric: "costPerLead" },
    { label: "Состоявшиеся разговоры", count: input.contactedCount, conversion: result.contactRate, cost: result.costPerContact, conversionMetric: "contactRate", costMetric: null },
    { label: "Назначенные встречи", count: input.meetingsBooked, conversion: result.bookingRate, cost: result.costPerBookedMeeting, conversionMetric: "bookingRate", costMetric: "costPerBookedMeeting" },
    { label: "Состоявшиеся встречи", count: input.meetingsHeld, conversion: result.showRate, cost: result.costPerHeldMeeting, conversionMetric: "showRate", costMetric: "costPerHeldMeeting" },
    { label: "Договоры", count: input.contractsCount, conversion: result.closeRate, cost: result.costPerContract, conversionMetric: "closeRate", costMetric: "costPerContract" },
  ];

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
      <ConversionResult input={input} metrics={result} statuses={statuses} />
    </section>
  );
}

export function FunnelResults({ input }: { input: FunnelInput }) {
  return <div className={styles.results} id="funnel-results"><Summary input={input} /></div>;
}
