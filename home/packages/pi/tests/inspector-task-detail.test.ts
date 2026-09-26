import { expect, mock, test } from "bun:test";
import { activityStore } from "../agent-configuration/harness/activity/store.ts";

const TEST_CWD = "/tmp";

mock.module("@earendil-works/pi-tui", () => ({
  visibleWidth: (text: string) => text.length,
  truncateToWidth: (text: string, width: number) => text.slice(0, width),
}));

const { buildDetail } = await import("../agent-configuration/harness/ui/inspector/detail.ts");

test("task detail shows current context, call count, and reasoning without redundant labels", () => {
  activityStore.clear();

  const entry = activityStore.begin({
    id: "task-1",
    toolName: "task",
    args: { title: "Locate pi harness", mission: "Locate files" },
    cwd: TEST_CWD,
    startedAt: 1000,
  });
  const subagentCalls = Array.from({ length: 5 }, (_, index) => ({
    id: `call-${index}`,
    toolName: "read",
    args: {},
    status: "success" as const,
    text: "",
    startedAt: 1000,
    endedAt: 1100,
  }));

  activityStore.finish(entry.id, {
    text: "done",
    status: "success",
    endedAt: 2000,
    usage: {
      inputTokens: 1000,
      outputTokens: 1000,
      cacheReadTokens: 17000,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
      totalTokens: 19000,
      contextTokens: 12000,
    },
    model: {
      provider: "test",
      id: "sample",
      reasoning: true,
      contextWindow: 272000,
    },
    thinkingLevel: "low",
    sub: subagentCalls,
  });

  const lines = buildDetail({ row: { entry }, width: 80 }).map((line) => line.text);
  const text = lines.join("\n");

  expect(lines[0]).toMatch(/^TASK · SUCCESS · /);
  expect(lines[1]).toBe("");
  expect(lines).toContain("REASONING low");
  expect(lines).toContain("CONTEXT 12k/272k | 5 calls");
  expect(text).not.toContain("supported");
  expect(text).not.toContain("peak");
  expect(text).not.toContain("spent");
  expect(text).not.toContain("WINDOW");
});

test("task input shows the effective role and default tools", () => {
  activityStore.clear();

  const entry = activityStore.begin({
    id: "task-role",
    toolName: "task",
    args: {
      title: "Inspect parser",
      mission: "Map parser behavior",
      role: "explore",
    },
    cwd: TEST_CWD,
    startedAt: 1000,
  });
  activityStore.finish(entry.id, {
    text: "done",
    status: "success",
    endedAt: 2000,
  });

  const detail = buildDetail({ row: { entry }, width: 100 });
  const text = detail.map((line) => line.text).join("\n");

  expect(text).toContain("role: explore");
  expect(text).toContain("effective tools: read, grep, find, ls");
});
