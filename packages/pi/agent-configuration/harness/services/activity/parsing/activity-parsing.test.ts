import { expect, test } from "bun:test";
import { readAssistantActivity, readSubagentMetadata, readSubagentUsage } from "../../../activity/parse.ts";

test("activity parsers reject malformed data and preserve reported usage", () => {
  expect(readAssistantActivity({ role: "user", content: [] })).toBeUndefined();
  expect(
    readAssistantActivity({
      role: "assistant",
      content: [
        { type: "thinking", thinking: "reason", redacted: true },
        { type: "text", text: "answer" },
        { type: "toolCall" },
      ],
    }),
  ).toEqual({ thinking: "reason", thinkingRedacted: true, response: "answer", hasToolCall: true });
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
