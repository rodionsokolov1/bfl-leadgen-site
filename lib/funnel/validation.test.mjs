import assert from "node:assert/strict";
import test from "node:test";

import { validateFunnelInput } from "./validation.ts";

test("accepts a valid funnel including decimal cost", () => {
  const errors = validateFunnelInput({ leadsCount: 10, costPerLead: 1499.5, contactedCount: 8, meetingsBooked: 4, meetingsHeld: 2, contractsCount: 1 });
  assert.deepEqual(errors, {});
});

test("rejects invalid downstream counts", () => {
  const errors = validateFunnelInput({ leadsCount: 10, costPerLead: 1000, contactedCount: 11, meetingsBooked: 12, meetingsHeld: 13, contractsCount: 14 });
  assert.ok(errors.contactedCount);
  assert.ok(errors.meetingsBooked);
  assert.ok(errors.meetingsHeld);
  assert.ok(errors.contractsCount);
});

test("requires integer counts and zeroes after a zero stage", () => {
  const fractional = validateFunnelInput({ leadsCount: 10.5, costPerLead: 1000, contactedCount: 0, meetingsBooked: 0, meetingsHeld: 0, contractsCount: 0 });
  assert.ok(fractional.leadsCount);
  const downstream = validateFunnelInput({ leadsCount: 10, costPerLead: 1000, contactedCount: 0, meetingsBooked: 1, meetingsHeld: 0, contractsCount: 0 });
  assert.ok(downstream.meetingsBooked);
});
