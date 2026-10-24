import { beforeEach, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../stores/activity/activity.store.ts";
import { renderPlainCard, resetCardStores, TEST_CWD } from "./subagent-card.test-double.ts";

beforeEach(resetCardStores);

test("a running subagent between tool calls keeps reading as running instead of Done", () => {
  activityStore.begin({
    id: "call-1",
    toolName: "task",
    args: { title: "Inspect parser" },
    cwd: TEST_CWD,
    startedAt: 0,
  });
  activityStore.update("call-1", {
    ...NO_TOOL_RESULT_FIELDS,
    text: "",
    status: { state: "absent" },
    sub: [
      {
        id: "read-1",
        toolName: "read",
        args: { path: "parser.ts" },
        status: "success",
        text: "done",
        startedAt: 1000,
        endedAt: { state: "present", value: 1400 },
      },
    ],
  });

  const lines = renderPlainCard("call-1", "Inspect parser").render(80).join("\n");

  expect(lines).toContain("READ parser.ts");
  expect(lines).toContain("Running...");
  expect(lines).not.toContain("Done");
});
