import test from "node:test";
import assert from "node:assert/strict";

import { healthStatus } from "../src/services/healthService.js";

test("healthStatus returns ok payload", () => {
  const payload = healthStatus();
  assert.equal(payload.status, "ok");
  assert.ok(payload.timestamp);
});
