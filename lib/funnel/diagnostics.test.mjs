import assert from "node:assert/strict";
import test from "node:test";

import { calculateFunnel } from "./calculations.ts";
import { diagnoseMetric, findPrimaryBottleneck, getNextBenchmarkTarget } from "./diagnostics.ts";

const boundaryCases = {
  costPerLead: [[799, "strong"], [800, "good"], [1499, "good"], [1500, "attention"], [2500, "attention"], [2501, "poor"]],
  contactRate: [[.39, "poor"], [.4, "attention"], [.59, "attention"], [.6, "good"], [.79, "good"], [.8, "strong"]],
  bookingRate: [[.14, "poor"], [.15, "attention"], [.24, "attention"], [.25, "good"], [.4, "good"], [.401, "strong"]],
  showRate: [[.24, "poor"], [.25, "attention"], [.39, "attention"], [.4, "good"], [.6, "good"], [.601, "strong"]],
  closeRate: [[.24, "poor"], [.25, "attention"], [.39, "attention"], [.4, "good"], [.6, "good"], [.601, "strong"]],
};

for (const [metric, cases] of Object.entries(boundaryCases)) {
  test("classifies exact boundaries for " + metric, () => {
    for (const [value, expected] of cases) assert.equal(diagnoseMetric(value, metric), expected);
  });
}

test("returns null when a rate cannot be calculated", () => {
  assert.equal(diagnoseMetric(null, "bookingRate"), null);
});

test("uses the next benchmark boundary as a model target", () => {
  assert.equal(getNextBenchmarkTarget("contactRate", "poor"), .4);
  assert.equal(getNextBenchmarkTarget("bookingRate", "good"), .401);
  assert.equal(getNextBenchmarkTarget("costPerLead", "attention"), 1500);
});

test("selects the problematic stage with the largest modeled effect", () => {
  const input = { leadsCount: 100, costPerLead: 1000, contactedCount: 50, meetingsBooked: 10, meetingsHeld: 5, contractsCount: 2 };
  assert.equal(findPrimaryBottleneck(input, calculateFunnel(input)), "booking_rate");
});

test("returns none when all available benchmark stages are good or strong", () => {
  const input = { leadsCount: 100, costPerLead: 1000, contactedCount: 80, meetingsBooked: 32, meetingsHeld: 16, contractsCount: 8 };
  assert.equal(findPrimaryBottleneck(input, calculateFunnel(input)), "none");
});
