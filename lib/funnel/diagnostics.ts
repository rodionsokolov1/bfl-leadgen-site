import { bottleneckContent, funnelBenchmarks } from "../../config/funnel.ts";
import type { FunnelInput, FunnelMetricKey, FunnelMetrics, FunnelStatus, PrimaryBottleneck } from "@/types/funnel";
import { calculateScenario, scenarioFromInput } from "./scenario.ts";

const bottleneckNames: Record<FunnelMetricKey, Exclude<PrimaryBottleneck, "none">> = {
  costPerLead: "cost_per_lead",
  contactRate: "contact_rate",
  bookingRate: "booking_rate",
  showRate: "show_rate",
  closeRate: "close_rate",
};

export function diagnoseMetric(value: number | null, metric: FunnelMetricKey): FunnelStatus | null {
  if (value === null || !Number.isFinite(value)) return null;
  const band = funnelBenchmarks[metric].bands.find((candidate) => {
    const aboveMin = candidate.min === undefined || (candidate.minInclusive === false ? value > candidate.min : value >= candidate.min);
    const belowMax = candidate.max === undefined || (candidate.maxInclusive === true ? value <= candidate.max : value < candidate.max);
    return aboveMin && belowMax;
  });
  return band?.status ?? null;
}

export function getNextBenchmarkTarget(metric: FunnelMetricKey, status: FunnelStatus): number | null {
  return funnelBenchmarks[metric].nextTarget[status] ?? null;
}

export function getFunnelStatuses(input: FunnelInput, metrics: FunnelMetrics) {
  return {
    costPerLead: diagnoseMetric(input.costPerLead, "costPerLead") ?? "poor",
    contactRate: diagnoseMetric(metrics.contactRate, "contactRate"),
    bookingRate: diagnoseMetric(metrics.bookingRate, "bookingRate"),
    showRate: diagnoseMetric(metrics.showRate, "showRate"),
    closeRate: diagnoseMetric(metrics.closeRate, "closeRate"),
  };
}

export function findPrimaryBottleneck(input: FunnelInput, metrics: FunnelMetrics, statuses = getFunnelStatuses(input, metrics)): PrimaryBottleneck {
  const metricValues: Record<FunnelMetricKey, number | null> = {
    costPerLead: input.costPerLead,
    contactRate: metrics.contactRate,
    bookingRate: metrics.bookingRate,
    showRate: metrics.showRate,
    closeRate: metrics.closeRate,
  };
  const candidates = (Object.keys(metricValues) as FunnelMetricKey[]).filter((metric) => statuses[metric] === "poor" || statuses[metric] === "attention");
  if (candidates.length === 0) return "none";

  const factual = scenarioFromInput(input);
  const current = calculateScenario(input, factual);
  let bestMetric = candidates[0];
  let bestEffect = -1;

  for (const metric of candidates) {
    const status = statuses[metric];
    if (!status) continue;
    const target = getNextBenchmarkTarget(metric, status);
    if (target === null) continue;

    let effect = 0;
    if (metric === "costPerLead") {
      effect = input.costPerLead > 0 ? Math.max(0, (input.costPerLead - target) / input.costPerLead) : 0;
    } else {
      const modeled = calculateScenario(input, { ...factual, [metric]: target });
      effect = current.contracts > 0
        ? Math.max(0, (modeled.contracts - current.contracts) / current.contracts)
        : Math.max(0, modeled.contracts - current.contracts);
    }
    if (effect > bestEffect) {
      bestEffect = effect;
      bestMetric = metric;
    }
  }
  return bottleneckNames[bestMetric];
}

export function primaryRecommendation(primaryBottleneck: PrimaryBottleneck): string {
  return primaryBottleneck === "none" ? "" : bottleneckContent[primaryBottleneck].recommendation;
}
