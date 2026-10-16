import { expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../agent-configuration/harness/constants/activity/no-tool-result-fields.constant.ts";
import { activityStore } from "../agent-configuration/harness/services/activity/store/shared-activity-store.service.ts";

const TEST_CWD = "/tmp";

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
    endedAt: { state: "present", value: 1100 } as const,
  }));

  activityStore.finish(entry.id, {
    ...NO_TOOL_RESULT_FIELDS,
    text: "done",
    status: "success",
    endedAt: 2000,
    usage: {
      usageState: "reported",
      usage: {
        inputTokens: 1000,
        outputTokens: 1000,
        cacheReadTokens: 17000,
        cacheWriteTokens: 0,
        reasoningTokens: 0,
        totalTokens: 19000,
        contextTokens: { state: "present", value: 12000 },
        maxContextTokens: { state: "absent" },
      },
    },
    model: {
      state: "present",
      value: {
        provider: "test",
        id: "sample",
        name: { state: "absent" },
        reasoning: { state: "present", value: true },
        contextWindow: { state: "present", value: 272000 },
      },
    },
    thinkingLevel: { state: "present", value: "low" },
    sub: subagentCalls,
  });

  const current = activityStore.lookup(entry.id);
  if (!current.found) throw new Error("task entry was not recorded");
  const lines = buildDetail({
    row: { level: "entry", entry: current.entry },
    width: 80,
    artifact: { kind: "tool-result" },
  }).map((line) => line.text);
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
    ...NO_TOOL_RESULT_FIELDS,
    text: "done",
    status: "success",
    endedAt: 2000,
  });

  const detail = buildDetail({ row: { level: "entry", entry }, width: 100, artifact: { kind: "tool-result" } });
  const text = detail.map((line) => line.text).join("\n");

  expect(text).toContain("role: explore");
  expect(text).toContain("effective tools: read, grep, find, ls");
});
