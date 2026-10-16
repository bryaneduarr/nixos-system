import { beforeEach, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../agent-configuration/harness/constants/activity/no-tool-result-fields.constant.ts";
import { readAssistantActivity } from "../agent-configuration/harness/services/activity/parsing/read-assistant-activity.service.ts";
import { readSubagentMetadata } from "../agent-configuration/harness/services/activity/parsing/read-subagent-metadata.service.ts";
import { readSubagentUsage } from "../agent-configuration/harness/services/activity/parsing/read-subagent-usage.service.ts";
import { activityStore } from "../agent-configuration/harness/services/activity/store/shared-activity-store.service.ts";
import { InspectorNavigation } from "../agent-configuration/harness/ui/inspector/navigation.ts";

beforeEach(() => activityStore.clear());

test("navigation follows the selected tool and its child calls", () => {
  const navigation = new InspectorNavigation(
    () => 20,
    () => 0,
    () => {},
  );
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
  expect(navigation.selectedId).toBe("task-1");
  expect(navigation.adjustSubagentCollapse("right")).toBe(true);
  expect(navigation.buildRows().map((row) => (row.level === "sub" ? row.sub.id : row.entry.id))).toEqual([
    "task-1",
    "read-1",
  ]);
  expect(navigation.selectedId).toBe("task-1::read-1");
  expect(navigation.adjustSubagentCollapse("left")).toBe(true);
  expect(navigation.selectedId).toBe("task-1");
});

test("navigation bounds scrolling to the detail viewport", () => {
  const navigation = new InspectorNavigation(
    () => 20,
    () => 30,
    () => {},
  );
  navigation.focus = "detail";
  navigation.detailViewportHeight = 10;
  navigation.step(100);
  expect(navigation.detailScroll).toBe(20);
  navigation.jump("start");
  expect(navigation.detailScroll).toBe(0);
});

test("activity parsers reject malformed data and preserve reported usage", () => {
  expect(readAssistantActivity({ role: "user", content: [] })).toEqual({ found: false });
  expect(
    readAssistantActivity({
      role: "assistant",
      content: [
        { type: "thinking", thinking: "reason", redacted: true },
        { type: "text", text: "answer" },
        { type: "toolCall" },
      ],
    }),
  ).toEqual({
    found: true,
    snapshot: { thinking: "reason", thinkingRedacted: true, response: "answer", hasToolCall: true },
  });
  expect(readSubagentUsage({ usage: { inputTokens: 2, outputTokens: 3, contextTokens: 4 } })).toMatchObject({
    usageState: "reported",
    usage: {
      inputTokens: 2,
      outputTokens: 3,
      totalTokens: 5,
      contextTokens: { state: "present", value: 4 },
    },
  });
  expect(readSubagentMetadata({ model: { provider: "example", id: "sample", contextWindow: -1 } })).toEqual({
    model: {
      state: "present",
      value: {
        provider: "example",
        id: "sample",
        name: { state: "absent" },
        reasoning: { state: "absent" },
        contextWindow: { state: "absent" },
      },
    },
    thinkingLevel: { state: "absent" },
  });
});
