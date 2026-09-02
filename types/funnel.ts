export type FunnelStatus = "strong" | "good" | "attention" | "poor";

export type FunnelLocalMetricKey =
  | "costPerLead"
  | "contactRate"
  | "bookingRate"
  | "showRate"
  | "closeRate";

export type FunnelEconomicMetricKey =
  | "costPerBookedMeeting"
  | "costPerHeldMeeting"
  | "costPerContract";

export type FunnelMetricKey = FunnelLocalMetricKey | FunnelEconomicMetricKey;

export type PrimaryBottleneck =
  | "cost_per_lead"
  | "contact_rate"
  | "booking_rate"
  | "show_rate"
  | "close_rate"
  | "none";

export interface FunnelInput {
  leadsCount: number;
  costPerLead: number;
  contactedCount: number;
  meetingsBooked: number;
  meetingsHeld: number;
  contractsCount: number;
}

export interface FunnelMetrics {
  adSpend: number;
  contactRate: number | null;
  costPerContact: number | null;
  bookingRate: number | null;
  costPerBookedMeeting: number | null;
  showRate: number | null;
  costPerHeldMeeting: number | null;
  closeRate: number | null;
  costPerContract: number | null;
  leadsPerContract: number | null;
}

export interface FunnelCalculation extends FunnelMetrics {
  losses: {
    beforeContact: number;
    afterContact: number;
    afterBooking: number;
    afterMeeting: number;
  };
}

export type FunnelField = keyof FunnelInput;

export interface FunnelAssessmentAttribution {
  trackingId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  yclid?: string;
  metrikaClientId?: string;
  landingPath?: string;
}

export interface FunnelAssessmentPayload {
  version: "small-company-v1";
  createdAt: string;
  period: { type: "last_full_month" };
  input: FunnelInput;
  metrics: FunnelMetrics;
  statuses: Record<FunnelMetricKey, FunnelStatus | null> & { costPerLead: FunnelStatus };
  diagnosis: {
    primaryBottleneck: PrimaryBottleneck;
    primaryVisibleRecommendation: string;
  };
  attribution: FunnelAssessmentAttribution;
}
