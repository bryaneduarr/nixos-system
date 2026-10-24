import { expect, test } from "bun:test";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { formatTime } from "../../../services/inspector/format/format-time.service.ts";
import { buildInspectorRows } from "../../../services/inspector/navigation/build-inspector-rows.service.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { SubToolActivity } from "../../../types/activity/parsing/subagent/sub-tool-activity.interface.ts";
import { renderToolList } from "./tool-list.component.ts";

const plainTheme = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
} satisfies Pick<Theme, "fg" | "bg">;

function subCall(id: string, toolName: string, startedAt: number): SubToolActivity {
  return { id, toolName, args: {}, status: "running", text: "", startedAt, endedAt: { state: "absent" } };
}

test("child calls of a subagent hang under it as a tree with their start times", () => {
  activityStore.clear();
  activityStore.begin({ id: "s", toolName: "task", args: { title: "Map parser" }, cwd: "/tmp", startedAt: 1_000 });
  activityStore.update("s", {
    ...NO_TOOL_RESULT_FIELDS,
    text: "",
    status: { state: "absent" },
    sub: [subCall("first", "read", 2_000), subCall("last", "run", 3_000)],
  });
  const rows = buildInspectorRows({ page: "tools", expandedTasks: new Set(["s"]), openedSubagent: { kind: "none" } });

  const lines = renderToolList({
    rows,
    width: 120,
    height: 3,
    scroll: 0,
    selected: 0,
    expandedTasks: new Set(["s"]),
    theme: plainTheme,
  });

  expect(lines[0]).toContain(`SUBAGENT TASK  ${formatTime(1_000)}`);
  expect(lines[1]).toContain(`├─ READ  ${formatTime(2_000)}`);
  expect(lines[2]).toContain(`└─ RUN  ${formatTime(3_000)}`);
});
