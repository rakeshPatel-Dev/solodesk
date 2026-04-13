import test from "node:test";
import assert from "node:assert/strict";
import { escapeRegex } from "../src/utils/escapeRegex.js";

test("escapeRegex escapes regex metacharacters", () => {
  const input = ".*+?^${}()|[]\\";
  const escaped = escapeRegex(input);

  assert.equal(escaped, "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
});

test("escapeRegex leaves literal text intact", () => {
  assert.equal(escapeRegex("client name 123"), "client name 123");
});
