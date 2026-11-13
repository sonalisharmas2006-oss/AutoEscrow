import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeApiBaseUrl,
  normalizeApiRequestPath,
  isUnexpectedApiPayload,
  summarizeApiFailure,
} from "../src/lib/apiHelpers.mjs";

test("normalizeApiBaseUrl appends /api/v1 exactly once", () => {
  assert.equal(normalizeApiBaseUrl("https://autoescrow-api-zaa0.onrender.com"), "https://autoescrow-api-zaa0.onrender.com/api/v1");
  assert.equal(normalizeApiBaseUrl("https://autoescrow-api-zaa0.onrender.com/api/v1"), "https://autoescrow-api-zaa0.onrender.com/api/v1");
});

test("normalizeApiRequestPath does not duplicate the V2 prefix", () => {
  const url = normalizeApiRequestPath("/marketplace/agents", "https://autoescrow-api-zaa0.onrender.com/api/v1");
  assert.equal(url, "https://autoescrow-api-zaa0.onrender.com/api/v1/marketplace/agents");
  const direct = normalizeApiRequestPath("/api/v1/jobs", "https://autoescrow-api-zaa0.onrender.com/api/v1");
  assert.equal(direct, "https://autoescrow-api-zaa0.onrender.com/api/v1/jobs");
});

test("JSON error payloads are summarized without raw HTML", () => {
  const summary = summarizeApiFailure(401, "application/json", { error: { code: "authentication_required", message: "Authentication is required." } }, "https://autoescrow-api-zaa0.onrender.com/api/v1/jobs");
  assert.match(summary, /Authentication is required|authentication_required/i);
});

test("HTML responses are flagged as proxy or URL issues", () => {
  const summary = summarizeApiFailure(502, "text/html; charset=utf-8", "<html><body>Proxy error</body></html>", "https://autoescrow-api-zaa0.onrender.com/api/v1/jobs");
  assert.match(summary, /HTML|proxy|wrong API base URL/i);
});

test("successful HTML payloads are rejected even when mislabeled as JSON", () => {
  assert.equal(isUnexpectedApiPayload("<html><body>Proxy error</body></html>", "text/html"), true);
  assert.equal(isUnexpectedApiPayload("<!doctype html><title>Error</title>", "application/json"), true);
  assert.equal(isUnexpectedApiPayload({ items: [] }, "application/json"), false);
});

test("empty responses produce a user-facing empty-state message", () => {
  const summary = summarizeApiFailure(200, "application/json", "", "https://autoescrow-api-zaa0.onrender.com/api/v1/marketplace/agents");
  assert.match(summary, /empty response/i);
});
