import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Static } from "typebox";
import { Value } from "typebox/value";
import { RUN_TOOL_NAME } from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import {
  AssistantEntrySchema,
  CompactionEntrySchema,
  ToolCallBlockSchema,
  ToolResultEntrySchema,
} from "../../../schemas/sessions/stats/session-entry.schema.ts";
import type { ModelStats } from "../../../types/sessions/stats/model-stats.interface.ts";
import type { SessionStats } from "../../../types/sessions/stats/session-stats.interface.ts";
import { splitLeadingCd } from "../../tools/run/split-leading-cd.service.ts";

const SESSION_FILE_EXTENSION = ".jsonl";

interface StatsAccumulator {
  sessions: number;
  compactions: number;
  readonly models: Map<string, ModelStats>;
  readonly tools: Map<string, number>;
}

function emptyModelStats(): ModelStats {
  return {
    turns: 0,
    toolCalls: 0,
    promptTokens: 0,
    cacheReadTokens: 0,
    largestPromptTokens: 0,
    cost: 0,
    toolErrors: 0,
    cdPrefixedRuns: 0,
  };
}

function parseLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function isCdPrefixedRun(block: unknown): boolean {
  if (!Value.Check(ToolCallBlockSchema, block) || block.name !== RUN_TOOL_NAME) return false;
  const command = block.arguments.command;
  return typeof command === "string" && splitLeadingCd(command).kind === "split";
}

function addAssistantTurn(entry: Static<typeof AssistantEntrySchema>, stats: StatsAccumulator): ModelStats {
  const { message } = entry;
  const key = `${message.provider}/${message.model}`;
  const currentModel = stats.models.get(key) ?? emptyModelStats();
  stats.models.set(key, currentModel);
  const prompt = message.usage.input + message.usage.cacheRead + message.usage.cacheWrite;
  currentModel.turns += 1;
  currentModel.promptTokens += prompt;
  currentModel.cacheReadTokens += message.usage.cacheRead;
  currentModel.largestPromptTokens = Math.max(currentModel.largestPromptTokens, prompt);
  currentModel.cost += message.usage.cost.total;
  for (const block of message.content) {
    if (!Value.Check(ToolCallBlockSchema, block)) continue;
    currentModel.toolCalls += 1;
    if (isCdPrefixedRun(block)) currentModel.cdPrefixedRuns += 1;
    const toolCount = stats.tools.get(block.name);
    stats.tools.set(block.name, toolCount === undefined ? 1 : toolCount + 1);
  }
  return currentModel;
}

function addSessionFile(content: string, stats: StatsAccumulator): void {
  let currentModel = emptyModelStats();
  for (const line of content.split("\n")) {
    const entry = parseLine(line);
    if (Value.Check(CompactionEntrySchema, entry)) stats.compactions += 1;
    if (Value.Check(ToolResultEntrySchema, entry) && entry.message.isError) currentModel.toolErrors += 1;
    if (Value.Check(AssistantEntrySchema, entry)) currentModel = addAssistantTurn(entry, stats);
  }
}

async function sessionFilesSince(sessionsDirectory: string, sinceMs: number): Promise<string[]> {
  const projectDirectories = await readdir(sessionsDirectory, { withFileTypes: true });
  const files: string[] = [];
  for (const projectDirectory of projectDirectories.filter((entry) => entry.isDirectory())) {
    const projectPath = join(sessionsDirectory, projectDirectory.name);
    for (const name of await readdir(projectPath)) {
      const file = join(projectPath, name);
      if (name.endsWith(SESSION_FILE_EXTENSION) && (await stat(file)).mtimeMs >= sinceMs) files.push(file);
    }
  }
  return files;
}

export async function collectSessionStats(sessionsDirectory: string, sinceMs: number): Promise<SessionStats> {
  const stats: StatsAccumulator = { sessions: 0, compactions: 0, models: new Map(), tools: new Map() };
  for (const file of await sessionFilesSince(sessionsDirectory, sinceMs)) {
    stats.sessions += 1;
    addSessionFile(await readFile(file, "utf8"), stats);
  }
  return stats;
}
