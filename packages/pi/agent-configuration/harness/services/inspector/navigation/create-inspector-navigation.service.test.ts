import { beforeEach, describe, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { createInspectorNavigation } from "./create-inspector-navigation.service.ts";

beforeEach(() => activityStore.clear());

describe("inspector navigation", () => {
  test("starts with subagents collapsed and follows the selected tool and its child calls", () => {
    const navigation = createInspectorNavigation({
      bodyHeight: () => 20,
      detailLength: () => 0,
      changed: () => {},
    });
    activityStore.begin({ id: "task-1", toolName: "task", args: {}, cwd: "/tmp", startedAt: 0 });
    activityStore.update("task-1", {
      ...NO_TOOL_RESULT_FIELDS,
      text: "",
      status: { state: "absent" },
      sub: [
        {
          id: "read-1",
          toolName: "read",
          args: {},
          status: "success",
          text: "ok",
          startedAt: 1,
          endedAt: { state: "absent" },
        },
      ],
    });
    navigation.syncSelection(navigation.buildRows());
    expect(navigation.buildRows().map((row) => row.entry.id)).toEqual(["task-1"]);
    expect(navigation.selection).toEqual({ kind: "row", id: "task-1" });
    expect(navigation.adjustSubagentCollapse("right")).toBe(true);
    expect(navigation.buildRows().map((row) => (row.level === "sub" ? row.sub.id : row.entry.id))).toEqual([
      "task-1",
      "read-1",
    ]);
    expect(navigation.selection).toEqual({ kind: "row", id: "task-1::read-1" });
    expect(navigation.adjustSubagentCollapse("left")).toBe(true);
    expect(navigation.selection).toEqual({ kind: "row", id: "task-1" });
    expect(navigation.buildRows().map((row) => row.entry.id)).toEqual(["task-1"]);
  });

  test("bounds scrolling to the detail viewport", () => {
    const navigation = createInspectorNavigation({
      bodyHeight: () => 20,
      detailLength: () => 30,
      changed: () => {},
    });
    navigation.focus = "detail";
    navigation.detailViewportHeight = 10;
    navigation.step(100);
    expect(navigation.detailScroll).toBe(20);
    navigation.jump("start");
    expect(navigation.detailScroll).toBe(0);
  });
});
