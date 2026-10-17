import { expect, test } from "bun:test";
import { readSubagentUsage } from "./read-subagent-usage.service.ts";

test("subagent usage keeps reported counts and sums them when no total is reported", () => {
  expect(readSubagentUsage({ usage: { inputTokens: 2, outputTokens: 3, contextTokens: 4 } })).toMatchObject({
    usageState: "reported",
    usage: {
      inputTokens: 2,
      outputTokens: 3,
      totalTokens: 5,
      contextTokens: { state: "present", value: 4 },
    },
  });
});
