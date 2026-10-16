import { expect, test } from "bun:test";
import { readAssistantActivity } from "./read-assistant-activity.service.ts";
import { readSubagentMetadata } from "./read-subagent-metadata.service.ts";
import { readSubagentUsage } from "./read-subagent-usage.service.ts";

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
