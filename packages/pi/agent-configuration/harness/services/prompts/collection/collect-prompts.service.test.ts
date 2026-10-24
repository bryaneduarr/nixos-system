import { expect, test } from "bun:test";
import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { collectPrompts } from "./collect-prompts.service.ts";

const timestamp = "2026-01-01T00:00:00.000Z";

test("collection uses only the current branch and preserves an unsent whitespace draft", () => {
  const draft = " \n\té";
  const branch: SessionEntry[] = [
    {
      type: "message",
      id: "1",
      parentId: null,
      timestamp,
      message: { role: "user", content: "earlier", timestamp: 1 },
    },
    {
      type: "custom_message",
      id: "2",
      parentId: "1",
      timestamp,
      customType: "note",
      content: "excluded custom",
      display: false,
    },
    {
      type: "message",
      id: "4",
      parentId: "2",
      timestamp,
      message: {
        role: "assistant",
        content: [{ type: "text", text: "excluded response" }],
        api: "anthropic-messages",
        provider: "anthropic",
        model: "test-model",
        usage: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 0,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
        },
        stopReason: "stop",
        timestamp: 3,
      },
    },
    {
      type: "message",
      id: "3",
      parentId: "2",
      timestamp,
      message: {
        role: "user",
        content: [
          { type: "text", text: "latest" },
          { type: "image", data: "", mimeType: "image/png" },
          { type: "text", text: "raw" },
        ],
        timestamp: 2,
      },
    },
  ];
  const branchBefore = structuredClone(branch);
  expect(collectPrompts(branch, draft).map((prompt) => prompt.text)).toEqual([draft, "latest\nraw", "earlier"]);
  expect(branch).toEqual(branchBefore);
  expect(collectPrompts([], draft)).toEqual([{ label: "Draft", text: draft, turn: { kind: "draft" } }]);
  expect(collectPrompts([], "")).toEqual([]);
});

test("a prompt without text still counts as a turn", () => {
  const userEntry = (
    id: string,
    content: string | { type: "image"; data: string; mimeType: string }[],
  ): SessionEntry => ({
    type: "message",
    id,
    parentId: null,
    timestamp,
    message: { role: "user", content, timestamp: 0 },
  });
  const branch = [
    userEntry("1", "first"),
    userEntry("2", [{ type: "image", data: "", mimeType: "image/png" }]),
    userEntry("3", "third"),
  ];

  expect(collectPrompts(branch, "").map((prompt) => [prompt.text, prompt.turn])).toEqual([
    ["third", { kind: "turn", turnsFromLatest: 0 }],
    ["first", { kind: "turn", turnsFromLatest: 2 }],
  ]);
});
