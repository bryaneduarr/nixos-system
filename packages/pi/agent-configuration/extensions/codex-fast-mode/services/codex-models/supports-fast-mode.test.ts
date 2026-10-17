import { expect, test } from "bun:test";
import { supportsFastMode } from "./supports-fast-mode.service.ts";

const PRIORITY_MODELS = new Set(["fast"]);

test("fast mode applies only to priority-capable models on the Codex Responses API", () => {
  const codexResponses = { provider: "openai-codex", api: "openai-codex-responses" };
  expect(supportsFastMode({ ...codexResponses, id: "fast" }, PRIORITY_MODELS)).toBe(true);
  expect(supportsFastMode({ ...codexResponses, id: "slow" }, PRIORITY_MODELS)).toBe(false);
  expect(supportsFastMode({ ...codexResponses, provider: "openai", id: "fast" }, PRIORITY_MODELS)).toBe(false);
  expect(supportsFastMode({ ...codexResponses, api: "openai-responses", id: "fast" }, PRIORITY_MODELS)).toBe(false);
});
