import assert from "node:assert/strict";
import test from "node:test";

import { calculateFunnel, estimatedAcquisitionSpend } from "./calculations.ts";

const input = {
  leadsCount: 100,
  costPerLead: 2000,
  contactedCount: 80,
  meetingsBooked: 40,
  meetingsHeld: 20,
  contractsCount: 5,
};

test("calculates every funnel metric from the specified formulas", () => {
  const result = calculateFunnel(input);
  assert.equal(result.adSpend, 200000);
  assert.equal(result.contactRate, .8);
  assert.equal(result.costPerContact, 2500);
  assert.equal(result.bookingRate, .5);
  assert.equal(result.costPerBookedMeeting, 5000);
  assert.equal(result.showRate, .5);
  assert.equal(result.costPerHeldMeeting, 10000);
  assert.equal(result.closeRate, .25);
  assert.equal(result.costPerContract, 40000);
  assert.equal(result.leadsPerContract, 20);
});

test("returns null instead of Infinity or NaN for zero denominators", () => {
  const result = calculateFunnel({
    leadsCount: 10,
    costPerLead: 2500,
    contactedCount: 0,
    meetingsBooked: 0,
    meetingsHeld: 0,
    contractsCount: 0,
  });
  assert.equal(result.contactRate, 0);
  assert.equal(result.costPerContact, null);
  assert.equal(result.bookingRate, null);
  assert.equal(result.costPerBookedMeeting, null);
  assert.equal(result.showRate, null);
  assert.equal(result.costPerHeldMeeting, null);
  assert.equal(result.closeRate, null);
  assert.equal(result.costPerContract, null);
  assert.equal(result.leadsPerContract, null);
});

test("estimates only non-negative acquisition spend", () => {
  assert.equal(estimatedAcquisitionSpend(12, 1800), 21600);
  assert.equal(estimatedAcquisitionSpend(-2, 1800), 0);
});
