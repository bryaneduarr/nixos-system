import { expect, test } from "bun:test";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { recordApiError } from "../../activity/record/record-api-error.service.ts";
import { transformTranscriptMarkdown } from "./transform-transcript-markdown.service.ts";

const longText = "original\n".repeat(30);

test("user prompts become previews and assistant replies stay unchanged", () => {
  const user = transformTranscriptMarkdown(longText, { messageType: "user", isStreaming: false, availableWidth: 80 });
  const assistant = transformTranscriptMarkdown(longText, {
    messageType: "assistant",
    isStreaming: true,
    availableWidth: 80,
  });

  expect(user).not.toBe(longText);
  expect(assistant).toBe(longText);
});

test("reply text that repeats a recorded API error is left to the error preview", () => {
  const errorMessage = "API Error: overloaded";
  const context = { messageType: "assistant" as const, isStreaming: false, availableWidth: 80 };
  activityStore.clear();
  recordApiError({ id: "api-error-test", message: errorMessage, cwd: "/tmp", occurredAt: 0 });

  expect(transformTranscriptMarkdown(errorMessage, context)).toBe("");
  expect(transformTranscriptMarkdown("A normal reply", context)).toBe("A normal reply");
  activityStore.clear();
});

test("thinking becomes a preview without a title for the transcript box to frame", () => {
  const thinking = transformTranscriptMarkdown(longText, {
    messageType: "assistant-thinking",
    isStreaming: false,
    availableWidth: 80,
  });

  expect(thinking).not.toContain("THINKING");
  expect(thinking).toContain("27 more lines");
});
