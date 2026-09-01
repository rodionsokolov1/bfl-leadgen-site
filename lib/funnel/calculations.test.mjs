import assert from "node:assert/strict";
import test from "node:test";

import { calculateFunnel, estimatedAcquisitionSpend } from "./calculations.ts";

test("calculates every stage from one consistent ad spend", () => {
  const result = calculateFunnel({
    leads: 100,
    avgCpl: 2000,
    contacted: 80,
    appointments: 40,
    heldMeetings: 20,
    contracts: 5,
  });

  assert.equal(result.adSpend, 200000);
  assert.equal(result.contactRate, 0.8);
  assert.equal(result.costPerContact, 2500);
  assert.equal(result.appointmentRate, 0.5);
  assert.equal(result.costPerAppointment, 5000);
  assert.equal(result.showRate, 0.5);
  assert.equal(result.costPerHeldMeeting, 10000);
  assert.equal(result.closeRate, 0.25);
  assert.equal(result.leadToContractRate, 0.05);
  assert.equal(result.costPerContract, 40000);
  assert.equal(result.leadsPerContract, 20);
  assert.deepEqual(result.losses, {
    beforeContact: 20,
    afterContact: 40,
    afterAppointment: 20,
    afterMeeting: 15,
  });
});

test("uses null instead of Infinity or NaN when a downstream stage is zero", () => {
  const result = calculateFunnel({
    leads: 10,
    avgCpl: 2500,
    contacted: 0,
    appointments: 0,
    heldMeetings: 0,
    contracts: 0,
  });

  assert.equal(result.contactRate, 0);
  assert.equal(result.costPerContact, null);
  assert.equal(result.appointmentRate, null);
  assert.equal(result.costPerAppointment, null);
  assert.equal(result.showRate, null);
  assert.equal(result.costPerHeldMeeting, null);
  assert.equal(result.closeRate, null);
  assert.equal(result.costPerContract, null);
  assert.equal(result.leadsPerContract, null);
  assert.equal(Object.values(result).some((value) => typeof value === "number" && !Number.isFinite(value)), false);
});

test("estimates only non-negative acquisition spend for lost contacts", () => {
  assert.equal(estimatedAcquisitionSpend(12, 1800), 21600);
  assert.equal(estimatedAcquisitionSpend(-2, 1800), 0);
});
