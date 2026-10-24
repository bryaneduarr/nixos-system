import { beforeEach, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorPage } from "../../../types/inspector/navigation/inspector-page.interface.ts";
import { buildInspectorRows } from "./build-inspector-rows.service.ts";

function begin(id: string, toolName: string, args: Record<string, unknown> = {}): void {
  activityStore.begin({ id, toolName, args, cwd: "/tmp", startedAt: 0 });
}

function rowName(row: InspectorRow): string {
  return row.level === "sub" ? row.sub.id : row.entry.toolName;
}

function listedNames(page: InspectorPage, expandedTasks: ReadonlySet<string> = new Set()): string[] {
  return buildInspectorRows({ page, expandedTasks, openedSubagent: { kind: "selected", id: "s" } }).map(rowName);
}

beforeEach(() => {
  activityStore.clear();
  begin("m", "message", { number: 1 });
  begin("t", "thinking");
  begin("r", "read", { path: "a.ts" });
  begin("s", "task", { title: "Map parser" });
  activityStore.update("s", {
    ...NO_TOOL_RESULT_FIELDS,
    text: "",
    status: { state: "absent" },
    sub: [
      {
        id: "s-read",
        toolName: "read",
        args: {},
        status: "success",
        text: "",
        startedAt: 1,
        endedAt: { state: "absent" },
      },
      {
        id: "s-run",
        toolName: "run",
        args: {},
        status: "running",
        text: "",
        startedAt: 2,
        endedAt: { state: "absent" },
      },
    ],
  });
  begin("p", "reply");
  begin("k", "tokens");
  begin("w", "warning");
  begin("e", "api error");
});

test("the history page lists only what the agent did besides tool calls, in order", () => {
  expect(listedNames("history")).toEqual(["thinking", "reply", "tokens", "warning", "api error"]);
});

test("the tools page lists every subagent tool call only once the task is expanded", () => {
  expect(listedNames("tools")).toEqual(["read", "task"]);
  expect(listedNames("tools", new Set(["s"]))).toEqual(["read", "task", "s-read", "s-run"]);
});

test("the subagent page lists the opened subagent followed by its whole tool history", () => {
  expect(listedNames("subagent")).toEqual(["task", "s-read", "s-run"]);
});
