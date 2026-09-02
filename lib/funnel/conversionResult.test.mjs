import assert from "node:assert/strict";
import test from "node:test";

import { calculateFunnel } from "./calculations.ts";
import { buildConversionResultModel } from "./conversionResult.ts";

function result(input) {
  return buildConversionResultModel(input, calculateFunnel(input));
}

test("shows scaling when contract economics and local stages are strong", () => {
  const model = result({ leadsCount: 100, costPerLead: 500, contactedCount: 80, meetingsBooked: 40, meetingsHeld: 20, contractsCount: 13 });
  assert.equal(model.overallDiagnosisType, "EXCELLENT");
  assert.equal(model.primaryBottleneck, "none");
  assert.match(model.focusTitle, /масштабировании/);
});

test("does not blame an expensive lead when downstream economics compensate it", () => {
  const model = result({ leadsCount: 100, costPerLead: 2800, contactedCount: 80, meetingsBooked: 40, meetingsHeld: 20, contractsCount: 10 });
  assert.equal(model.overallDiagnosisType, "GOOD");
  assert.match(model.title, /итоговая экономика остаётся хорошей/);
  assert.match(model.focusTitle, /любой ценой/);
});

test("uses contact rate as the dynamic focus when it has the largest modeled effect", () => {
  const model = result({ leadsCount: 100, costPerLead: 1599, contactedCount: 40, meetingsBooked: 20, meetingsHeld: 10, contractsCount: 2 });
  assert.equal(model.overallDiagnosisType, "EXPENSIVE");
  assert.equal(model.primaryBottleneck, "contact_rate");
  assert.match(model.focusTitle, /дозвон/);
});

test("recognizes cumulative losses when several impacts are close", () => {
  const model = result({ leadsCount: 100, costPerLead: 1599, contactedCount: 60, meetingsBooked: 15, meetingsHeld: 6, contractsCount: 3 });
  assert.equal(model.overallDiagnosisType, "MULTIPLE_BOTTLENECKS");
  assert.equal(model.multipleBottlenecks, true);
  assert.ok(model.secondaryBottleneckCount > 0);
});
