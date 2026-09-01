import type { FunnelInput } from "@/types/funnel";

export interface FunnelScenario {
  avgCpl: number;
  contactRate: number;
  appointmentRate: number;
  showRate: number;
  closeRate: number;
}

export interface ScenarioResult {
  adSpend: number;
  leads: number;
  contacted: number;
  appointments: number;
  heldMeetings: number;
  contracts: number;
  costPerContract: number | null;
}

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

export function scenarioFromInput(input: FunnelInput): FunnelScenario {
  return {
    avgCpl: input.avgCpl,
    contactRate: safeDivide(input.contacted, input.leads) ?? 0,
    appointmentRate: safeDivide(input.appointments, input.contacted) ?? 0,
    showRate: safeDivide(input.heldMeetings, input.appointments) ?? 0,
    closeRate: safeDivide(input.contracts, input.heldMeetings) ?? 0,
  };
}

export function calculateScenario(base: FunnelInput, scenario: FunnelScenario): ScenarioResult {
  const adSpend = base.leads * base.avgCpl;
  const leads = scenario.avgCpl > 0 ? adSpend / scenario.avgCpl : 0;
  const contacted = leads * clampRate(scenario.contactRate);
  const appointments = contacted * clampRate(scenario.appointmentRate);
  const heldMeetings = appointments * clampRate(scenario.showRate);
  const contracts = heldMeetings * clampRate(scenario.closeRate);

  return {
    adSpend,
    leads,
    contacted,
    appointments,
    heldMeetings,
    contracts,
    costPerContract: safeDivide(adSpend, contracts),
  };
}
