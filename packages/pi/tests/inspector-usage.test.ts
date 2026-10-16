import { expect, test } from "bun:test";
import {
  compactUsageLabel,
  contextUsageLabel,
  modelLabel,
  modelShortLabel,
  usageLabel,
} from "../agent-configuration/harness/ui/inspector/usage.ts";

const model = {
  provider: "example",
  id: "sample-model",
  name: "Sample model",
  contextWindow: 20_000,
};

test("model labels include the provider when showing full details", () => {
  expect(modelLabel(model)).toBe("Sample model (example/sample-model)");
  expect(modelShortLabel(model)).toBe("Sample model");
  expect(modelLabel(undefined)).toBe("model —");
});

test("usage labels distinguish total tokens from current and peak context", () => {
  const usage = { totalTokens: 5_000, contextTokens: 1_000, maxContextTokens: 2_000 };
  expect(usageLabel(usage, model)).toBe("spent 5.0k · max ctx 2.0k/20k (10%)");
  expect(compactUsageLabel(usage, model)).toBe("spent 5.0k · peak 2.0k/20k");
  expect(contextUsageLabel(usage, model)).toBe("now 1.0k/20k (5.0%) · peak 2.0k/20k (10%)");
});

test("missing usage or context window does not produce a percentage", () => {
  expect(usageLabel(undefined, model)).toBe("spent — · max ctx —");
  expect(contextUsageLabel(undefined, undefined)).toBe("now — · peak —");
});
