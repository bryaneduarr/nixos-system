import { beforeEach, expect, test } from "bun:test";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { recordedNames } from "../store/read-recorded-names.test-double.ts";
import { createAssistantMessageRecorder } from "./create-assistant-message-recorder.service.ts";

const assistantMessage: AssistantMessage = {
  role: "assistant",
  content: [
    { type: "thinking", thinking: "Planning." },
    { type: "text", text: "The result is ready." },
  ],
  api: "anthropic-messages",
  provider: "anthropic",
  model: "test-model",
  usage: {
    input: 300,
    output: 50,
    cacheRead: 0,
    cacheWrite: 0,
    totalTokens: 350,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  },
  stopReason: "stop",
  timestamp: 0,
};

beforeEach(() => {
  activityStore.clear();
});

test("a streamed final reply is recorded with its token usage when the message ends", () => {
  const recorder = createAssistantMessageRecorder();

  recorder.start(assistantMessage);
  recorder.update(assistantMessage, "/tmp");
  expect(recordedNames()).toEqual(["thinking"]);

  recorder.end(assistantMessage, "/tmp");
  expect(recordedNames()).toEqual(["thinking", "reply", "tokens"]);
});

test("a message that never started records no reply or tokens", () => {
  createAssistantMessageRecorder().end(assistantMessage, "/tmp");

  expect(recordedNames()).toEqual([]);
});
