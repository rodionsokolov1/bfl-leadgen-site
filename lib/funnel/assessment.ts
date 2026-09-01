import { funnelThresholds } from "@/config/funnel";
import type { AttributionContext } from "@/lib/attribution/attribution";
import { calculateFunnel } from "./calculations";
import { diagnoseMetric } from "./diagnostics";
import type { FunnelAssessmentPayload, FunnelAssessmentTracking, FunnelInput } from "@/types/funnel";

export function assessmentTrackingFromAttribution(context: AttributionContext): FunnelAssessmentTracking {
  const data = { ...context.firstTouch, ...context.current };
  return {
    utmSource: data.utm_source,
    utmMedium: data.utm_medium,
    utmCampaign: data.utm_campaign,
    utmContent: data.utm_content,
    utmTerm: data.utm_term,
    yclid: data.yclid,
    metrikaClientId: data.ym_client_id,
    landingVariant: data.landing_version,
  };
}

export function createAssessmentId(): string {
  return globalThis.crypto.randomUUID();
}

export function buildFunnelAssessmentPayload(
  input: FunnelInput,
  tracking: FunnelAssessmentTracking,
  assessmentId = createAssessmentId(),
  createdAt = new Date().toISOString(),
): FunnelAssessmentPayload {
  const calculation = calculateFunnel(input);
  const calculated = {
    adSpend: calculation.adSpend,
    contactRate: calculation.contactRate,
    costPerContact: calculation.costPerContact,
    appointmentRate: calculation.appointmentRate,
    costPerAppointment: calculation.costPerAppointment,
    showRate: calculation.showRate,
    costPerHeldMeeting: calculation.costPerHeldMeeting,
    closeRate: calculation.closeRate,
    leadToContractRate: calculation.leadToContractRate,
    costPerContract: calculation.costPerContract,
    leadsPerContract: calculation.leadsPerContract,
  };
  return {
    assessmentId,
    createdAt,
    segment: "small_company",
    input,
    calculated,
    statuses: {
      cpl: diagnoseMetric(input.avgCpl, funnelThresholds.cpl),
      contactRate: diagnoseMetric(calculated.contactRate, funnelThresholds.contactRate),
      appointmentRate: diagnoseMetric(calculated.appointmentRate, funnelThresholds.appointmentRate),
      showRate: diagnoseMetric(calculated.showRate, funnelThresholds.showRate),
      closeRate: diagnoseMetric(calculated.closeRate, funnelThresholds.closeRate),
    },
    tracking,
  };
}
