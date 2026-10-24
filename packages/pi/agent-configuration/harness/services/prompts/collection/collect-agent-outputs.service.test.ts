import { expect, test } from "bun:test";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { collectAgentOutputs } from "./collect-agent-outputs.service.ts";

const timestamp = "2026-01-01T00:00:00.000Z";
const usage = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  totalTokens: 0,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
};

function assistantEntry(id: string, content: AssistantMessage["content"]): SessionEntry {
  return {
    type: "message",
    id,
    parentId: null,
    timestamp,
    message: {
      role: "assistant",
      content,
      api: "anthropic-messages",
      provider: "anthropic",
      model: "test-model",
      usage,
      stopReason: "stop",
      timestamp: 1,
    },
  } satisfies SessionEntry;
}

test("agent outputs keep only reply text, newest first", () => {
  const branch: SessionEntry[] = [
    {
      type: "message",
      id: "u",
      parentId: null,
      timestamp,
      message: { role: "user", content: "question", timestamp: 0 },
    },
    assistantEntry("a1", [{ type: "text", text: "first reply" }]),
    assistantEntry("a2", [
      { type: "thinking", thinking: "hidden" },
      { type: "toolCall", id: "c", name: "read", arguments: {} },
    ]),
    assistantEntry("a3", [
      { type: "text", text: "second" },
      { type: "text", text: "reply" },
    ]),
  ];

  expect(collectAgentOutputs(branch)).toEqual([
    { text: "second\nreply", label: "1.", turn: { kind: "turn", turnsFromLatest: 0 } },
    { text: "first reply", label: "2.", turn: { kind: "turn", turnsFromLatest: 0 } },
  ]);
});

test("each output records how many turns before the latest one it belongs to", () => {
  const userEntry = (id: string): SessionEntry => ({
    type: "message",
    id,
    parentId: null,
    timestamp,
    message: { role: "user", content: id, timestamp: 0 },
  });
  const branch: SessionEntry[] = [
    userEntry("u1"),
    assistantEntry("a1", [{ type: "text", text: "first" }]),
    userEntry("u2"),
    assistantEntry("a2", [{ type: "text", text: "second" }]),
    assistantEntry("a3", [{ type: "text", text: "third" }]),
  ];

  expect(collectAgentOutputs(branch).map((output) => [output.text, output.turn])).toEqual([
    ["third", { kind: "turn", turnsFromLatest: 0 }],
    ["second", { kind: "turn", turnsFromLatest: 0 }],
    ["first", { kind: "turn", turnsFromLatest: 1 }],
  ]);
});
