import { beforeEach, expect, test } from "bun:test";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { activityStore } from "../../activity/store.ts";

const TEST_CWD = "/tmp";

const { renderSubagentCard } = await import("./subagent-card.component.ts");
const { resetActivityVisibility, toggleActivityVisibility, setAgentWorking } = await import(
  "../../ui/activity/visibility.ts"
);

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
} as Theme;

beforeEach(() => {
  activityStore.clear();
  resetActivityVisibility();
  setAgentWorking(true);
});

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
    sub: activity,
    details: {
      id: "worker-1",
      title: "Inspect parser",
      currentTask: "read parser.ts",
      status: "running",
      model: { provider: "test", id: "sample" },
      activity,
    },
  });

  const card = renderSubagentCard(theme, "call-1", "Inspect parser");
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
  const card = renderSubagentCard(theme, "partial-call", undefined);
  const lines = card.render(80).join("\n");

  expect(lines).toContain("+-- / SUBAGENT ");
  expect(lines).toContain("Preparing task");
  expect(lines).toContain("Starting");
});

test("a completed card shows the last tool's duration without earlier calls or total time", () => {
  activityStore.begin({
    id: "done-call",
    toolName: "task",
    args: { title: "Locate pi harness" },
    cwd: TEST_CWD,
    startedAt: 1000,
  });
  const activity = [
    {
      id: "bash-1",
      toolName: "bash",
      args: { command: "pwd" },
      status: "success" as const,
      text: "done",
      startedAt: 1000,
      endedAt: { state: "present" as const, value: 1100 },
    },
    {
      id: "grep-1",
      toolName: "grep",
      args: {},
      status: "success" as const,
      text: "done",
      startedAt: 1000,
      endedAt: { state: "present" as const, value: 2200 },
    },
  ];

  activityStore.finish("done-call", {
    sub: activity,
    text: "done",
    status: "success",
    endedAt: 35400,
    details: {
      title: "Locate pi harness",
      currentTask: "Completed",
      status: "success",
      model: { provider: "test", id: "sample" },
      activity,
    },
  });

  const card = renderSubagentCard(theme, "done-call", "Locate pi harness");
  const lines = card.render(80).join("\n");

  expect(lines).toContain("+-- SUBAGENT ");
  expect(lines).not.toContain("+-- / SUBAGENT ");
  expect(lines).toContain("Locate pi harness");
  expect(lines).toContain("GREP");
  expect(lines).toContain("Done");
  expect(lines).toContain("Time: 1.2 s");
  expect(lines).not.toContain("BASH");
  expect(lines).toContain("Completed");
  expect(lines).not.toContain("34.4 s");
  expect(lines).not.toContain("Model");
  expect(lines).not.toContain("Task:");
});

test("Alt+V hides the subagent box and the renderer reuses its component", () => {
  activityStore.begin({
    id: "call-1",
    toolName: "task",
    args: {},
    cwd: TEST_CWD,
  });
  const card = renderSubagentCard(theme, "call-1", "Inspect parser");

  expect(card.render(80).length).toBeGreaterThan(0);
  toggleActivityVisibility();
  expect(card.render(80)).toEqual([]);
  toggleActivityVisibility();

  const reusedCard = renderSubagentCard(theme, "call-1", "Inspect parser", undefined, card);
  expect(reusedCard).toBe(card);
});
