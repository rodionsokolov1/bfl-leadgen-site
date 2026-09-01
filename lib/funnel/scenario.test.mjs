import assert from "node:assert/strict";
import test from "node:test";

import { calculateScenario, scenarioFromInput } from "./scenario.ts";

const base = { leadsCount: 100, costPerLead: 2000, contactedCount: 80, meetingsBooked: 40, meetingsHeld: 20, contractsCount: 5 };

test("starts from the user's factual funnel", () => {
  const result = calculateScenario(base, scenarioFromInput(base));
  assert.equal(result.adSpend, 200000);
  assert.equal(result.leads, 100);
  assert.equal(result.contracts, 5);
  assert.equal(result.costPerContract, 40000);
});

test("keeps ad spend fixed when cost per lead changes", () => {
  const scenario = { ...scenarioFromInput(base), costPerLead: 1000 };
  const result = calculateScenario(base, scenario);
  assert.equal(result.adSpend, 200000);
  assert.equal(result.leads, 200);
  assert.equal(result.contracts, 10);
  assert.equal(result.costPerContract, 20000);
});

test("returns null cost instead of Infinity when model contracts are zero", () => {
  const scenario = { ...scenarioFromInput(base), closeRate: 0 };
  const result = calculateScenario(base, scenario);
  assert.equal(result.contracts, 0);
  assert.equal(result.costPerContract, null);
});
