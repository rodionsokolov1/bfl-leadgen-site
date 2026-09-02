import type { FunnelInput } from "@/types/funnel";
import { safeDivide } from "./calculations.ts";

export interface FunnelScenario {
  costPerLead: number;
  contactRate: number;
  bookingRate: number;
  showRate: number;
  closeRate: number;
}

export interface ScenarioResult {
  adSpend: number;
  leads: number;
  contacted: number;
  booked: number;
  held: number;
  contracts: number;
  costPerContact: number | null;
  costPerBookedMeeting: number | null;
  costPerHeldMeeting: number | null;
  costPerContract: number | null;
}

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function scenarioFromInput(input: FunnelInput): FunnelScenario {
  return {
    costPerLead: input.costPerLead,
    contactRate: safeDivide(input.contactedCount, input.leadsCount) ?? 0,
    bookingRate: safeDivide(input.meetingsBooked, input.contactedCount) ?? 0,
    showRate: safeDivide(input.meetingsHeld, input.meetingsBooked) ?? 0,
    closeRate: safeDivide(input.contractsCount, input.meetingsHeld) ?? 0,
  };
}

export function calculateScenario(base: FunnelInput, scenario: FunnelScenario): ScenarioResult {
  const adSpend = base.leadsCount * base.costPerLead;
  const leads = scenario.costPerLead > 0 ? adSpend / scenario.costPerLead : 0;
  const contacted = leads * clampRate(scenario.contactRate);
  const booked = contacted * clampRate(scenario.bookingRate);
  const held = booked * clampRate(scenario.showRate);
  const contracts = held * clampRate(scenario.closeRate);
  return {
    adSpend,
    leads,
    contacted,
    booked,
    held,
    contracts,
    costPerContact: safeDivide(adSpend, contacted),
    costPerBookedMeeting: safeDivide(adSpend, booked),
    costPerHeldMeeting: safeDivide(adSpend, held),
    costPerContract: safeDivide(adSpend, contracts),
  };
}
