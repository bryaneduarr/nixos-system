import { beforeEach, expect, test } from "bun:test";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { ToolActivityUsage } from "../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import type { AssistantActivitySnapshot } from "../../../types/activity/store/assistant-activity-snapshot.interface.ts";
import { recordedNames } from "../store/read-recorded-names.test-double.ts";
import { recordAssistantTurn } from "./record-assistant-turn.service.ts";

const TIMING = { cwd: "/tmp", startedAt: 1000, endedAt: 3500 };

const reportedUsage: ToolActivityUsage = {
  usageState: "reported",
  usage: {
    inputTokens: 1200,
    outputTokens: 340,
    cacheReadTokens: 5100,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    totalTokens: 6640,
    contextTokens: { state: "absent" },
    maxContextTokens: { state: "absent" },
  },
};
const unreportedUsage: ToolActivityUsage = { usageState: "unreported" };

function snapshot(response: string, hasToolCall: boolean): AssistantActivitySnapshot {
  return { thinking: "", thinkingRedacted: false, response, hasToolCall };
}

beforeEach(() => {
  activityStore.clear();
});

test("a final reply and its token usage are recorded as two entries", () => {
  recordAssistantTurn({
    idSuffix: "turn-1",
    snapshot: snapshot("All done.", false),
    usage: reportedUsage,
    hasApiError: false,
    ...TIMING,
  });

  const [reply, tokens] = activityStore.all();
  expect(recordedNames()).toEqual(["reply", "tokens"]);
  expect(reply).toMatchObject({ id: "reply-turn-1", text: "All done.", startedAt: 1000 });
  expect(tokens).toMatchObject({
    id: "tokens-turn-1",
    text: "in 1.2k · out 340 · cache read 5.1k · cache write 0",
    usage: reportedUsage,
    endedAt: { state: "present", value: 3500 },
  });
});

test("text that comes with a tool call is not a final reply", () => {
  recordAssistantTurn({
    idSuffix: "turn-2",
    snapshot: snapshot("Reading the file.", true),
    usage: reportedUsage,
    hasApiError: false,
    ...TIMING,
  });

  expect(recordedNames()).toEqual(["tokens"]);
});

test("an API error and unreported usage record nothing extra", () => {
  recordAssistantTurn({
    idSuffix: "turn-3",
    snapshot: snapshot("Error text repeated as a reply.", false),
    usage: unreportedUsage,
    hasApiError: true,
    ...TIMING,
  });
  recordAssistantTurn({
    idSuffix: "turn-4",
    snapshot: snapshot("   ", false),
    usage: unreportedUsage,
    hasApiError: false,
    ...TIMING,
  });

  expect(recordedNames()).toEqual([]);
});
