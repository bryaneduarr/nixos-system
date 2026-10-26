import { beforeEach, expect, test } from "bun:test";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { hydrateAssistantMessage } from "./hydrate-assistant-message.service.ts";

beforeEach(() => {
  activityStore.clear();
});

test("a resumed assistant message restores thinking, its reply, and its token usage in order", () => {
  hydrateAssistantMessage({
    entryId: "entry-1",
    message: {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "Considering the question." },
        { type: "text", text: "Here is the answer." },
      ],
      usage: { input: 900, output: 120, cacheRead: 4000, cacheWrite: 10, totalTokens: 5030 },
    },
    cwd: "/tmp",
    startedAt: 5000,
  });

  const entries = activityStore.all();
  expect(entries.map((entry) => entry.toolName)).toEqual(["thinking", "reply", "tokens"]);
  expect(entries[1]).toMatchObject({ text: "Here is the answer." });
  expect(entries[2]).toMatchObject({ text: "in 900 · out 120 · cache read 4.0k · cache write 10" });
});

test("a resumed message without reported usage restores no token entry", () => {
  hydrateAssistantMessage({
    entryId: "entry-2",
    message: { role: "assistant", content: [{ type: "text", text: "No usage here." }] },
    cwd: "/tmp",
    startedAt: 5000,
  });

  expect(activityStore.all().map((entry) => entry.toolName)).toEqual(["reply"]);
});
