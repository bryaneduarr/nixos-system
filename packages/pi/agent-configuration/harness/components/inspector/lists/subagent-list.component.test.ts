import { beforeEach, expect, test } from "bun:test";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import { renderSubagentList } from "./subagent-list.component.ts";

const plainTheme = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
} satisfies Pick<Theme, "fg" | "bg">;

function recordedSubagent(): ToolActivity {
  activityStore.clear();
  activityStore.begin({
    id: "s",
    toolName: "task",
    args: { title: "Map parser" },
    cwd: "/tmp",
    startedAt: Date.now() - 65_000,
  });
  activityStore.update("s", {
    ...NO_TOOL_RESULT_FIELDS,
    text: "",
    status: { state: "absent" },
    thinkingLevel: { state: "present", value: "high" },
    model: {
      state: "present",
      value: {
        provider: "example",
        id: "sample-model",
        name: { state: "present", value: "Sample model" },
        reasoning: { state: "present", value: true },
        contextWindow: { state: "present", value: 200_000 },
      },
    },
    usage: {
      usageState: "reported",
      usage: {
        inputTokens: 40_000,
        outputTokens: 2_000,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        reasoningTokens: 0,
        totalTokens: 42_000,
        contextTokens: { state: "present", value: 30_000 },
        maxContextTokens: { state: "present", value: 30_000 },
      },
    },
  });
  const lookup = activityStore.lookup("s");
  if (!lookup.found) throw new Error("subagent entry was not recorded");
  return lookup.entry;
}

beforeEach(() => activityStore.clear());

test("each subagent row shows status, time, context against the limit, model, and reasoning without dots", () => {
  const lines = renderSubagentList({
    rows: [recordedSubagent()],
    width: 120,
    height: 5,
    scroll: 0,
    selection: { kind: "none" },
    theme: plainTheme,
  });
  const text = lines.join("\n");

  expect(lines[0]).toContain("1 subagents  1 running  42k tokens spent");
  expect(lines[1]).toMatch(/^# +STATUS +TIME +CONTEXT +SPENT +MODEL +REASONING/);
  expect(lines[2]).toMatch(/^01 +running +1m 0[5-6]s +30k\/200k \(15%\) +42k +Sample model +high/);
  expect(text).not.toContain("·");
  expect(text).not.toContain("—");
});
