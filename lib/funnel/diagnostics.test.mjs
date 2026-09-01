import assert from "node:assert/strict";
import test from "node:test";

import { diagnoseMetric } from "./diagnostics.ts";

const cplThreshold = {
  direction: "lower_is_better",
  badFrom: 3000,
  attentionFrom: null,
  goodUntil: null,
  excellentUntil: null,
  target: null,
};

test("marks only CPL strictly above 3000 as bad", () => {
  assert.equal(diagnoseMetric(3001, cplThreshold), "bad");
  assert.equal(diagnoseMetric(3000, cplThreshold), "unscored");
  assert.equal(diagnoseMetric(2500, cplThreshold), "unscored");
});

test("returns unscored when higher-is-better thresholds are not configured", () => {
  const emptyThreshold = {
    direction: "higher_is_better",
    badBelow: null,
    attentionBelow: null,
    goodFrom: null,
    excellentFrom: null,
    target: null,
  };
  assert.equal(diagnoseMetric(0.01, emptyThreshold), "unscored");
  assert.equal(diagnoseMetric(0.99, emptyThreshold), "unscored");
  assert.equal(diagnoseMetric(null, emptyThreshold), "unscored");
});
