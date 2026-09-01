import type { AttributionContext } from "@/lib/attribution/attribution";
import type { FunnelAssessmentAttribution, FunnelAssessmentPayload, FunnelInput } from "@/types/funnel";
import { calculateFunnel } from "./calculations.ts";
import { findPrimaryBottleneck, getFunnelStatuses, primaryRecommendation } from "./diagnostics.ts";

export function assessmentAttributionFromContext(context: AttributionContext): FunnelAssessmentAttribution {
  const data = { ...context.firstTouch, ...context.current };
  return {
    trackingId: data.tracking_id,
    utmSource: data.utm_source,
    utmMedium: data.utm_medium,
    utmCampaign: data.utm_campaign,
    utmContent: data.utm_content,
    utmTerm: data.utm_term,
    yclid: data.yclid,
    metrikaClientId: data.ym_client_id,
    landingPath: typeof window === "undefined" ? undefined : window.location.pathname,
  };
}

export function buildFunnelAssessmentPayload(
  input: FunnelInput,
  attribution: FunnelAssessmentAttribution,
  createdAt = new Date().toISOString(),
): FunnelAssessmentPayload {
  const calculation = calculateFunnel(input);
  const metrics = {
    adSpend: calculation.adSpend,
    contactRate: calculation.contactRate,
    costPerContact: calculation.costPerContact,
    bookingRate: calculation.bookingRate,
    costPerBookedMeeting: calculation.costPerBookedMeeting,
    showRate: calculation.showRate,
    costPerHeldMeeting: calculation.costPerHeldMeeting,
    closeRate: calculation.closeRate,
    costPerContract: calculation.costPerContract,
    leadsPerContract: calculation.leadsPerContract,
  };
  const statuses = getFunnelStatuses(input, metrics);
  const primaryBottleneck = findPrimaryBottleneck(input, metrics, statuses);
  return {
    version: "small-company-v1",
    createdAt,
    period: { type: "last_full_month" },
    input,
    metrics,
    statuses,
    diagnosis: {
      primaryBottleneck,
      primaryVisibleRecommendation: primaryRecommendation(primaryBottleneck),
    },
    attribution,
  };
}
