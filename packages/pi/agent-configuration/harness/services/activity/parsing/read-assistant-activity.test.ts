import { expect, test } from "bun:test";
import { readAssistantActivity } from "./read-assistant-activity.service.ts";

test("assistant activity reports nothing for a non-assistant message", () => {
  expect(readAssistantActivity({ role: "user", content: [] })).toEqual({ found: false });
});

test("assistant activity reads redacted thinking, response text, and tool calls", () => {
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
});
