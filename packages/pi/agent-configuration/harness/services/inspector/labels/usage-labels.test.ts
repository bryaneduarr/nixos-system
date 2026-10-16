import { expect, test } from "bun:test";
import { compactUsageLabel } from "./compact-usage-label.service.ts";
import { contextUsageLabel } from "./context-usage-label.service.ts";
import { modelLabel } from "./model-label.service.ts";
import { modelShortLabel } from "./model-short-label.service.ts";
import { usageLabel } from "./usage-label.service.ts";

const model = {
  provider: "example",
  id: "sample-model",
  name: { state: "present", value: "Sample model" },
  reasoning: { state: "absent" },
  contextWindow: { state: "present", value: 20_000 },
} as const;

test("model labels include the provider when showing full details", () => {
  expect(modelLabel(model)).toBe("Sample model (example/sample-model)");
  expect(modelShortLabel(model)).toBe("Sample model");
  expect(modelLabel(undefined)).toBe("model —");
});

test("usage labels distinguish total tokens from current and peak context", () => {
  const usage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    totalTokens: 5_000,
    contextTokens: { state: "present", value: 1_000 },
    maxContextTokens: { state: "present", value: 2_000 },
  } as const;
  expect(usageLabel(usage, model)).toBe("spent 5.0k · max ctx 2.0k/20k (10%)");
  expect(compactUsageLabel(usage, model)).toBe("spent 5.0k · peak 2.0k/20k");
  expect(contextUsageLabel(usage, model)).toBe("now 1.0k/20k (5.0%) · peak 2.0k/20k (10%)");
});

test("missing usage or context window does not produce a percentage", () => {
  expect(usageLabel(undefined, model)).toBe("spent — · max ctx —");
  expect(contextUsageLabel(undefined, undefined)).toBe("now — · peak —");
});
