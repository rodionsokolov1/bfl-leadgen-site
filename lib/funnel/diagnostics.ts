import type { FunnelThreshold, MetricStatus } from "@/config/funnel";

export function diagnoseMetric(value: number | null, threshold: FunnelThreshold): MetricStatus {
  if (value === null || !Number.isFinite(value)) return "unscored";

  if (threshold.direction === "lower_is_better") {
    if (threshold.badFrom !== null && value > threshold.badFrom) return "bad";
    if (threshold.attentionFrom !== null && value > threshold.attentionFrom) return "attention";
    if (threshold.excellentUntil !== null && value <= threshold.excellentUntil) return "excellent";
    if (threshold.goodUntil !== null && value <= threshold.goodUntil) return "good";
    return "unscored";
  }

  if (threshold.badBelow !== null && value < threshold.badBelow) return "bad";
  if (threshold.attentionBelow !== null && value < threshold.attentionBelow) return "attention";
  if (threshold.excellentFrom !== null && value >= threshold.excellentFrom) return "excellent";
  if (threshold.goodFrom !== null && value >= threshold.goodFrom) return "good";
  return "unscored";
}
