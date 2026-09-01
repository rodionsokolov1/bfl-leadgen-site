import type { FunnelCalculation, FunnelInput } from "@/types/funnel";

function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

export function calculateFunnel(input: FunnelInput): FunnelCalculation {
  const adSpend = input.leads * input.avgCpl;

  return {
    adSpend,
    contactRate: safeDivide(input.contacted, input.leads),
    costPerContact: safeDivide(adSpend, input.contacted),
    appointmentRate: safeDivide(input.appointments, input.contacted),
    costPerAppointment: safeDivide(adSpend, input.appointments),
    showRate: safeDivide(input.heldMeetings, input.appointments),
    costPerHeldMeeting: safeDivide(adSpend, input.heldMeetings),
    closeRate: safeDivide(input.contracts, input.heldMeetings),
    leadToContractRate: safeDivide(input.contracts, input.leads),
    costPerContract: safeDivide(adSpend, input.contracts),
    leadsPerContract: safeDivide(input.leads, input.contracts),
    losses: {
      beforeContact: input.leads - input.contacted,
      afterContact: input.contacted - input.appointments,
      afterAppointment: input.appointments - input.heldMeetings,
      afterMeeting: input.heldMeetings - input.contracts,
    },
  };
}

export function estimatedAcquisitionSpend(lostCount: number, avgCpl: number): number {
  return Math.max(0, lostCount) * Math.max(0, avgCpl);
}
