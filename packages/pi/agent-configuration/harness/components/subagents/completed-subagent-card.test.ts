import { beforeEach, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../../constants/activity/no-tool-result-fields.constant.ts";
import { activityStore } from "../../services/activity/store/shared-activity-store.service.ts";
import { activityVisibility } from "../../services/activity/visibility/shared-activity-visibility.service.ts";
import { noLiveProgress, noPreviousComponent, plainSubagentCardTheme } from "./subagent-card.test-double.ts";

const TEST_CWD = "/tmp";

const { renderSubagentCard } = await import("./subagent-card.component.ts");

beforeEach(() => {
  activityStore.clear();
  activityVisibility.reset();
  activityVisibility.setAgentWorking(true);
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
    ...NO_TOOL_RESULT_FIELDS,
    sub: activity,
    text: "done",
    status: "success",
    endedAt: 35400,
  });

  const card = renderSubagentCard(
    plainSubagentCardTheme,
    "done-call",
    "Locate pi harness",
    noLiveProgress,
    noPreviousComponent,
  );
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
