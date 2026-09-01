import assert from "node:assert/strict";
import test from "node:test";

import { buildFunnelAssessmentPayload } from "./assessment.ts";

test("serializes the complete assessment contract", () => {
  const input = { leadsCount: 100, costPerLead: 1000, contactedCount: 80, meetingsBooked: 32, meetingsHeld: 16, contractsCount: 8 };
  const payload = buildFunnelAssessmentPayload(input, { utmSource: "test", trackingId: "track-1", landingPath: "/quiz" }, "2026-09-01T00:00:00.000Z");
  assert.equal(payload.version, "small-company-v1");
  assert.deepEqual(payload.period, { type: "last_full_month" });
  assert.deepEqual(payload.input, input);
  assert.equal(payload.metrics.costPerContract, 12500);
  assert.equal(payload.statuses.costPerLead, "good");
  assert.equal(payload.diagnosis.primaryBottleneck, "none");
  assert.equal(payload.attribution.trackingId, "track-1");
  assert.deepEqual(JSON.parse(JSON.stringify(payload)), payload);
});
