export interface FunnelInput {
  leads: number;
  avgCpl: number;
  contacted: number;
  appointments: number;
  heldMeetings: number;
  contracts: number;
}

export interface FunnelCalculation {
  adSpend: number;
  contactRate: number | null;
  costPerContact: number | null;
  appointmentRate: number | null;
  costPerAppointment: number | null;
  showRate: number | null;
  costPerHeldMeeting: number | null;
  closeRate: number | null;
  leadToContractRate: number | null;
  costPerContract: number | null;
  leadsPerContract: number | null;
  losses: {
    beforeContact: number;
    afterContact: number;
    afterAppointment: number;
    afterMeeting: number;
  };
}

export type FunnelField = keyof FunnelInput;

export interface FunnelAssessmentTracking {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  yclid?: string;
  metrikaClientId?: string;
  landingVariant?: string;
}

export interface FunnelAssessmentPayload {
  assessmentId: string;
  createdAt: string;
  segment: "small_company";
  input: FunnelInput;
  calculated: Omit<FunnelCalculation, "losses">;
  statuses: {
    cpl: import("@/config/funnel").MetricStatus;
    contactRate: import("@/config/funnel").MetricStatus;
    appointmentRate: import("@/config/funnel").MetricStatus;
    showRate: import("@/config/funnel").MetricStatus;
    closeRate: import("@/config/funnel").MetricStatus;
  };
  tracking: FunnelAssessmentTracking;
}
