import { beforeEach, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../stores/activity/activity.store.ts";
import { activityVisibility } from "../../stores/activity/activity-visibility.store.ts";
import { renderPlainCard, renderPlainCardAgain, resetCardStores, TEST_CWD } from "./subagent-card.test-double.ts";

beforeEach(resetCardStores);

test("the card shows only the active tool, its target, and its state", () => {
  const startedAt = Date.now();
  activityStore.begin({
    id: "call-1",
    toolName: "task",
    args: { title: "Inspect parser", mission: "Secret long mission" },
    cwd: TEST_CWD,
    startedAt: startedAt - 2000,
  });
  const activity = [
    {
      id: "read-1",
      toolName: "read",
      args: { path: "parser.ts" },
      status: "success" as const,
      text: "done",
      startedAt: 1000,
      endedAt: { state: "present" as const, value: 2400 },
    },
    {
      id: "bash-1",
      toolName: "bash",
      args: { command: "pwd" },
      status: "running" as const,
      text: "",
      startedAt: startedAt - 500,
      endedAt: { state: "absent" as const },
    },
  ];

  activityStore.update("call-1", {
    ...NO_TOOL_RESULT_FIELDS,
    text: "",
    status: { state: "absent" },
    sub: activity,
  });

  const card = renderPlainCard("call-1", "Inspect parser");
  const lines = card.render(80).join("\n");

  expect(lines).toContain("+-- / SUBAGENT ");
  expect(lines).toMatch(/\| Inspect parser\s+\|/);
  expect(lines).toContain("BASH pwd");
  expect(lines).toContain("Running...");
  expect(lines).not.toContain("READ");
  expect(lines).toMatch(/Time: 0\.[0-9] s/);
  expect(lines).not.toContain("2.0 s");
  expect(lines).not.toContain("·");
  expect(lines).not.toContain("sample");
  expect(lines).not.toContain("parser.ts");
  expect(lines).not.toContain("Secret long mission");
});

test("the card renders while Pi streams an incomplete tool call", () => {
  const card = renderPlainCard("partial-call", "");
  const lines = card.render(80).join("\n");

  expect(lines).toContain("+-- / SUBAGENT ");
  expect(lines).toContain("Preparing task");
  expect(lines).toContain("Starting");
});

test("Alt+V hides the subagent box and the renderer reuses its component", () => {
  activityStore.begin({
    id: "call-1",
    toolName: "task",
    args: {},
    cwd: TEST_CWD,
    startedAt: Date.now(),
  });
  const card = renderPlainCard("call-1", "Inspect parser");

  expect(card.render(80).length).toBeGreaterThan(0);
  activityVisibility.toggle();
  expect(card.render(80)).toEqual([]);
  activityVisibility.toggle();

  const reusedCard = renderPlainCardAgain("call-1", "Inspect parser", card);
  expect(reusedCard).toBe(card);
});
