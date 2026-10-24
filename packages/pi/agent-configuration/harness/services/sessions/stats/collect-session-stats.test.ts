import { afterAll, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectSessionStats } from "./collect-session-stats.service.ts";
import { formatSessionStats } from "./format-session-stats.service.ts";

const sessionsDirectory = await mkdtemp(join(tmpdir(), "session-stats-"));

afterAll(async () => {
  await rm(sessionsDirectory, { recursive: true, force: true });
});

function assistantTurn(command: string): string {
  return JSON.stringify({
    type: "message",
    message: {
      role: "assistant",
      provider: "example",
      model: "small",
      usage: { input: 100, cacheRead: 900, cacheWrite: 0, cost: { total: 0.5 } },
      content: [{ type: "thinking" }, { type: "toolCall", name: "run", arguments: { command } }],
    },
  });
}

test("aggregates turns, prompt tokens, errors, compactions, and cd-prefixed runs per model", async () => {
  await mkdir(join(sessionsDirectory, "project"));
  const lines = [
    JSON.stringify({ type: "session" }),
    assistantTurn("cd /tmp && ls"),
    JSON.stringify({ type: "message", message: { role: "toolResult", isError: true } }),
    assistantTurn("git status"),
    JSON.stringify({ type: "compaction" }),
    "not json",
  ];
  await writeFile(join(sessionsDirectory, "project", "one.jsonl"), lines.join("\n"));

  const stats = await collectSessionStats(sessionsDirectory, 0);

  expect(stats.sessions).toBe(1);
  expect(stats.compactions).toBe(1);
  expect(stats.tools.get("run")).toBe(2);
  expect(stats.models.get("example/small")).toEqual({
    turns: 2,
    toolCalls: 2,
    promptTokens: 2000,
    cacheReadTokens: 1800,
    largestPromptTokens: 1000,
    cost: 1,
    toolErrors: 1,
    cdPrefixedRuns: 1,
  });
  expect(formatSessionStats(stats, 7)).toContain("cache hit 90%");
});
