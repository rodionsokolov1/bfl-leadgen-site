import type { FunnelCalculation, FunnelInput } from "@/types/funnel";

export function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

export type RequiredConversion = {
  rate: number | null;
  achievable: boolean;
};

export function requiredConversion(previousStageCost: number | null, targetNextStageCost: number): RequiredConversion {
  if (previousStageCost === null || !Number.isFinite(previousStageCost) || previousStageCost < 0 || !Number.isFinite(targetNextStageCost) || targetNextStageCost <= 0) {
    return { rate: null, achievable: false };
  }
  const rate = previousStageCost / targetNextStageCost;
  return { rate, achievable: rate <= 1 };
}

export function calculateFunnel(input: FunnelInput): FunnelCalculation {
  const adSpend = input.leadsCount * input.costPerLead;
  return {
    adSpend,
    contactRate: safeDivide(input.contactedCount, input.leadsCount),
    costPerContact: safeDivide(adSpend, input.contactedCount),
    bookingRate: safeDivide(input.meetingsBooked, input.contactedCount),
    costPerBookedMeeting: safeDivide(adSpend, input.meetingsBooked),
    showRate: safeDivide(input.meetingsHeld, input.meetingsBooked),
    costPerHeldMeeting: safeDivide(adSpend, input.meetingsHeld),
    closeRate: safeDivide(input.contractsCount, input.meetingsHeld),
    costPerContract: safeDivide(adSpend, input.contractsCount),
    leadsPerContract: safeDivide(input.leadsCount, input.contractsCount),
    losses: {
      beforeContact: input.leadsCount - input.contactedCount,
      afterContact: input.contactedCount - input.meetingsBooked,
      afterBooking: input.meetingsBooked - input.meetingsHeld,
      afterMeeting: input.meetingsHeld - input.contractsCount,
    },
  };
}

export function estimatedAcquisitionSpend(count: number, costPerLead: number): number {
  return Math.max(0, count) * Math.max(0, costPerLead);
}
