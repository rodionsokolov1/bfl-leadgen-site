import { bottleneckContent, funnelBenchmarks } from "../../config/funnel.ts";
import type {
  FunnelEconomicMetricKey,
  FunnelBottleneckImpact,
  FunnelInput,
  FunnelLocalMetricKey,
  FunnelMetricKey,
  FunnelMetrics,
  FunnelStatus,
  OverallDiagnosisType,
  PrimaryBottleneck,
} from "@/types/funnel";
import { requiredConversion } from "./calculations.ts";
import { calculateScenario, scenarioFromInput } from "./scenario.ts";

export type FunnelStatuses = Record<FunnelMetricKey, FunnelStatus | null> & { costPerLead: FunnelStatus };

export type DynamicConversionTarget = {
  targetCost: number;
  requiredRate: number | null;
  achievable: boolean;
};

export type FunnelConclusion = {
  kind: "healthy" | "economy_mismatch" | "economy_attention" | "local_bottleneck";
  title: string;
};

export type BottleneckAnalysis = {
  primaryBottleneck: PrimaryBottleneck;
  primaryBottleneckImpact: number | null;
  secondaryBottlenecks: FunnelBottleneckImpact[];
  multipleBottlenecks: boolean;
};

const bottleneckNames: Record<FunnelLocalMetricKey, Exclude<PrimaryBottleneck, "none">> = {
  costPerLead: "cost_per_lead",
  contactRate: "contact_rate",
  bookingRate: "booking_rate",
  showRate: "show_rate",
  closeRate: "close_rate",
};

const economicStage: Partial<Record<FunnelLocalMetricKey, {
  metric: FunnelEconomicMetricKey;
  previousCost: keyof Pick<FunnelMetrics, "costPerContact" | "costPerBookedMeeting" | "costPerHeldMeeting">;
}>> = {
  bookingRate: { metric: "costPerBookedMeeting", previousCost: "costPerContact" },
  showRate: { metric: "costPerHeldMeeting", previousCost: "costPerBookedMeeting" },
  closeRate: { metric: "costPerContract", previousCost: "costPerHeldMeeting" },
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

export function getFunnelStatuses(input: FunnelInput, metrics: FunnelMetrics): FunnelStatuses {
  return {
    costPerLead: diagnoseMetric(input.costPerLead, "costPerLead") ?? "poor",
    contactRate: diagnoseMetric(metrics.contactRate, "contactRate"),
    bookingRate: diagnoseMetric(metrics.bookingRate, "bookingRate"),
    costPerBookedMeeting: diagnoseMetric(metrics.costPerBookedMeeting, "costPerBookedMeeting"),
    showRate: diagnoseMetric(metrics.showRate, "showRate"),
    costPerHeldMeeting: diagnoseMetric(metrics.costPerHeldMeeting, "costPerHeldMeeting"),
    closeRate: diagnoseMetric(metrics.closeRate, "closeRate"),
    costPerContract: diagnoseMetric(metrics.costPerContract, "costPerContract"),
  };
}

function nextCandidateTarget(
  metric: FunnelLocalMetricKey,
  currentValue: number,
  localStatus: FunnelStatus,
  metrics: FunnelMetrics,
  statuses: FunnelStatuses,
): number | null {
  const targets: number[] = [];
  const localTarget = getNextBenchmarkTarget(metric, localStatus);
  if (localTarget !== null && localTarget > currentValue && localTarget <= 1) targets.push(localTarget);

  const stage = economicStage[metric];
  if (stage) {
    const economicStatus = statuses[stage.metric];
    const targetCost = economicStatus ? getNextBenchmarkTarget(stage.metric, economicStatus) : null;
    if (targetCost !== null) {
      const target = requiredConversion(metrics[stage.previousCost], targetCost);
      if (target.achievable && target.rate !== null && target.rate > currentValue) targets.push(target.rate);
    }
  }

  return targets.length > 0 ? Math.min(...targets) : null;
}

export function analyzeBottlenecks(input: FunnelInput, metrics: FunnelMetrics, statuses = getFunnelStatuses(input, metrics)): BottleneckAnalysis {
  const localValues: Record<FunnelLocalMetricKey, number | null> = {
    costPerLead: input.costPerLead,
    contactRate: metrics.contactRate,
    bookingRate: metrics.bookingRate,
    showRate: metrics.showRate,
    closeRate: metrics.closeRate,
  };
  const overallEconomicIssue = statuses.costPerContract === "attention" || statuses.costPerContract === "poor";
  const candidates = (Object.keys(localValues) as FunnelLocalMetricKey[]).filter((metric) => {
    const localStatus = statuses[metric];
    if (!localStatus) return false;
    const stage = economicStage[metric];
    const economicStatus = stage ? statuses[stage.metric] : null;
    const localIssue = localStatus === "attention" || localStatus === "poor";
    const economicIssue = economicStatus === "attention" || economicStatus === "poor";
    if (metric === "costPerLead") return localIssue && overallEconomicIssue;
    return localIssue || economicIssue || (overallEconomicIssue && localStatus !== "strong");
  });
  if (candidates.length === 0) {
    return { primaryBottleneck: "none", primaryBottleneckImpact: null, secondaryBottlenecks: [], multipleBottlenecks: false };
  }

  const factual = scenarioFromInput(input);
  const current = calculateScenario(input, factual);
  const impacts: FunnelBottleneckImpact[] = [];

  for (const metric of candidates) {
    const currentValue = localValues[metric];
    const status = statuses[metric];
    if (currentValue === null || !status) continue;

    let target: number | null;
    if (metric === "costPerLead") {
      target = getNextBenchmarkTarget(metric, status);
      if (target !== null && target >= currentValue) target = null;
    } else {
      target = nextCandidateTarget(metric, currentValue, status, metrics, statuses);
    }
    if (target === null) continue;

    const modeled = calculateScenario(input, { ...factual, [metric]: target });
    const effect = current.costPerContract !== null && modeled.costPerContract !== null
      ? Math.max(0, current.costPerContract - modeled.costPerContract)
      : Math.max(0, modeled.contracts - current.contracts);
    if (effect > 0) {
      impacts.push({
        bottleneck: bottleneckNames[metric],
        metric,
        impact: effect,
        status,
      });
    }
  }

  impacts.sort((left, right) => right.impact - left.impact);
  const primary = impacts[0];
  if (!primary) {
    return { primaryBottleneck: "none", primaryBottleneckImpact: null, secondaryBottlenecks: [], multipleBottlenecks: false };
  }
  const closeImpacts = impacts.slice(1).filter((candidate) => candidate.impact >= primary.impact * .75);
  return {
    primaryBottleneck: primary.bottleneck,
    primaryBottleneckImpact: primary.impact,
    secondaryBottlenecks: closeImpacts,
    multipleBottlenecks: closeImpacts.length > 0,
  };
}

export function findPrimaryBottleneck(input: FunnelInput, metrics: FunnelMetrics, statuses = getFunnelStatuses(input, metrics)): PrimaryBottleneck {
  return analyzeBottlenecks(input, metrics, statuses).primaryBottleneck;
}

export function getOverallDiagnosisType(
  metrics: FunnelMetrics,
  statuses: FunnelStatuses,
  analysis: BottleneckAnalysis,
): OverallDiagnosisType {
  const cost = metrics.costPerContract;
  const conversionStatuses = [statuses.contactRate, statuses.bookingRate, statuses.showRate, statuses.closeRate];
  const hasCriticalStage = conversionStatuses.some((status) => status === "poor");
  const conversionsHealthy = conversionStatuses.every((status) => status === "strong" || status === "good");

  if (analysis.multipleBottlenecks || (statuses.costPerContract === "poor" && conversionsHealthy && analysis.primaryBottleneck === "none")) {
    return "MULTIPLE_BOTTLENECKS";
  }
  if (cost !== null && cost <= 25000 && !hasCriticalStage) return "EXCELLENT";
  if (cost !== null && cost <= 40000 && !hasCriticalStage) return "GOOD";
  if (cost !== null && cost > 50000) return "EXPENSIVE";
  return "NEEDS_IMPROVEMENT";
}

export function getDynamicConversionTargets(primary: PrimaryBottleneck, metrics: FunnelMetrics, statuses: FunnelStatuses): DynamicConversionTarget[] {
  const metric = primary === "booking_rate" ? "bookingRate"
    : primary === "show_rate" ? "showRate"
      : primary === "close_rate" ? "closeRate"
        : null;
  if (!metric) return [];
  const stage = economicStage[metric];
  if (!stage) return [];
  const status = statuses[stage.metric];
  if (!status || status === "strong") return [];

  const targetStatuses: FunnelStatus[] = status === "poor" ? ["poor", "attention"]
    : status === "attention" ? ["attention", "good"]
      : ["good"];

  return targetStatuses.flatMap((targetStatus) => {
    const targetCost = getNextBenchmarkTarget(stage.metric, targetStatus);
    if (targetCost === null) return [];
    const target = requiredConversion(metrics[stage.previousCost], targetCost);
    return [{ targetCost, requiredRate: target.rate, achievable: target.achievable }];
  });
}

export function getFunnelConclusion(statuses: FunnelStatuses, primary: PrimaryBottleneck): FunnelConclusion {
  const conversionStatuses = [statuses.contactRate, statuses.bookingRate, statuses.showRate, statuses.closeRate];
  const conversionsHealthy = conversionStatuses.every((status) => status === "strong" || status === "good");

  if (statuses.costPerContract === "poor") {
    return {
      kind: conversionsHealthy ? "economy_mismatch" : "economy_attention",
      title: conversionsHealthy
        ? "Конверсии выглядят нормально. Но экономика воронки уже не сходится."
        : "Стоимость договора показывает, что экономику воронки нужно докручивать.",
    };
  }
  if (statuses.costPerContract === "attention") {
    return { kind: "economy_attention", title: "В экономике воронки есть что докрутить." };
  }
  if (primary === "none" && (statuses.costPerContract === "strong" || statuses.costPerContract === "good")) {
    return { kind: "healthy", title: "Явного провала внутри воронки не видно" };
  }
  return {
    kind: "local_bottleneck",
    title: primary === "none" ? "Воронке нужен дополнительный разбор" : bottleneckContent[primary].title,
  };
}

export function primaryRecommendation(primaryBottleneck: PrimaryBottleneck): string {
  return primaryBottleneck === "none" ? "" : bottleneckContent[primaryBottleneck].recommendation;
}
