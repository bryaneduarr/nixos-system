import { describe, expect, test } from "bun:test";
import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import { contextUsageLabel } from "../context/context-usage-label.service.ts";
import { modelLabel } from "../model/model-label.service.ts";
import { modelShortLabel } from "../model/model-short-label.service.ts";
import { usageLabel } from "./usage-label.service.ts";

const subagentModel = {
  provider: "example",
  id: "sample-model",
  name: { state: "present", value: "Sample model" },
  reasoning: { state: "absent" },
  contextWindow: { state: "present", value: 20_000 },
} as const satisfies SubagentModel;
const model = { state: "present", value: subagentModel } as const;

describe("model labels", () => {
  test("model labels include the provider when showing full details", () => {
    expect(modelLabel(model)).toBe("Sample model (example/sample-model)");
    expect(modelShortLabel(model)).toBe("Sample model");
    expect(modelLabel({ state: "absent" })).toBe("model unknown");
  });
});

describe("usage labels", () => {
  test("usage labels distinguish total tokens from current and peak context", () => {
    const usage = {
      usageState: "reported",
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        reasoningTokens: 0,
        totalTokens: 5_000,
        contextTokens: { state: "present", value: 1_000 },
        maxContextTokens: { state: "present", value: 2_000 },
      },
    } as const;
    expect(usageLabel(usage, model)).toBe("spent 5.0k  max ctx 2.0k/20k (10%)");
    expect(contextUsageLabel(usage, model)).toBe("1.0k/20k (5.0%)");
  });

  test("missing usage or context window does not produce a percentage", () => {
    expect(usageLabel({ usageState: "unreported" }, { state: "absent" })).toBe("spent -  max ctx -");
    expect(contextUsageLabel({ usageState: "unreported" }, { state: "absent" })).toBe("-/-");
  });
});
