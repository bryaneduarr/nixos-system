import { beforeEach, expect, test } from "bun:test";
import { activityStore } from "../../../../stores/activity/activity.store.ts";
import { recordTokens } from "../../../activity/record/record-tokens.service.ts";
import { buildDetail } from "./build-detail.service.ts";

beforeEach(() => {
  activityStore.clear();
});

test("the detail of a token entry lists every count and notes that reasoning is part of output", () => {
  recordTokens(
    { id: "tokens-1", cwd: "/tmp", startedAt: 0, endedAt: 1500 },
    {
      inputTokens: 1234,
      outputTokens: 340,
      cacheReadTokens: 5100,
      cacheWriteTokens: 0,
      reasoningTokens: 120,
      totalTokens: 6674,
      contextTokens: { state: "absent" },
      maxContextTokens: { state: "absent" },
    },
  );
  const entry = activityStore.all()[0];
  if (entry === undefined) throw new Error("The token entry was not recorded.");

  const text = buildDetail({ row: { level: "entry", entry }, width: 60, artifact: { kind: "tool-result" } })
    .map((line) => line.text)
    .join("\n");

  expect(text).toContain("TOKENS");
  expect(text).toContain("Input       1,234");
  expect(text).toContain("Cache read  5,100");
  expect(text).toContain("Reasoning   120 (included in output)");
  expect(text).toContain("Total       6,674");
});
