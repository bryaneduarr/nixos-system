import { randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import {
  NEW_SESSION_REASON,
  STARTUP_SESSION_REASON,
  TUI_RUNTIME_MODE,
} from "./last-model/constants/runtime/runtime.constant.ts";
import {
  MESSAGE_ENTRY_TYPE,
  MODEL_CHANGE_ENTRY_TYPE,
  THINKING_LEVEL_CHANGE_ENTRY_TYPE,
} from "./last-model/constants/session-history/session-entry-type.constant.ts";
import { SavedModelFileSchema } from "./last-model/schemas/model-selection/saved-model-file.schema.ts";
import { ThinkingLevelSchema } from "./last-model/schemas/model-selection/thinking-level.schema.ts";
import {
  ModelChangeEntrySchema,
  SessionEntryTypeSchema,
  ThinkingLevelChangeEntrySchema,
} from "./last-model/schemas/session-history/session-entry.schema.ts";
import type {
  ModelSelection,
  ModelSelectionLookup,
  ThinkingChoice,
} from "./last-model/types/model-selection/model-selection.interface.ts";

const stateDirectory = join(process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"), "pi");
const stateFile = join(stateDirectory, "last-model.json");
const unchosenThinking: ThinkingChoice = { state: "unchosen" };

function thinkingChoiceFrom(value: unknown): ThinkingChoice {
  return Value.Check(ThinkingLevelSchema, value) ? { state: "chosen", level: value } : unchosenThinking;
}

function savedModelFromFile(value: unknown): ModelSelectionLookup {
  if (!Value.Check(SavedModelFileSchema, value)) return { found: false };
  const thinkingValue = "thinkingLevel" in value ? value.thinkingLevel : undefined;
  return {
    found: true,
    selection: { provider: value.provider, id: value.id, thinking: thinkingChoiceFrom(thinkingValue) },
  };
}

function readSavedModel(): ModelSelectionLookup {
  try {
    const value: unknown = JSON.parse(readFileSync(stateFile, "utf8"));
    return savedModelFromFile(value);
  } catch {
    return { found: false };
  }
}

function savedModelFileRecord(selection: ModelSelection) {
  const identity = { provider: selection.provider, id: selection.id };
  return selection.thinking.state === "chosen" ? { ...identity, thinkingLevel: selection.thinking.level } : identity;
}

function saveModel(selection: ModelSelection): void {
  mkdirSync(stateDirectory, { recursive: true });
  const temporary = `${stateFile}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(savedModelFileRecord(selection))}\n`, { mode: 0o600 });
  renameSync(temporary, stateFile);
}

function sessionModelFromEntry(entry: unknown): ModelSelectionLookup {
  if (!Value.Check(ModelChangeEntrySchema, entry)) return { found: false };
  return { found: true, selection: { provider: entry.provider, id: entry.modelId, thinking: unchosenThinking } };
}

// On the first launch after installation, use the most recently used session.
function recentSessionModel(currentSessionFile: string | undefined): ModelSelectionLookup {
  const sessionsDirectory = join(homedir(), ".pi", "agent", "sessions");
  const files: { path: string; modified: number }[] = [];
  function collect(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) collect(path);
      else if (entry.isFile() && entry.name.endsWith(".jsonl") && path !== currentSessionFile) {
        files.push({ path, modified: statSync(path).mtimeMs });
      }
    }
  }
  try {
    collect(sessionsDirectory);
  } catch {
    return { found: false };
  }
  files.sort((a, b) => b.modified - a.modified);
  for (const file of files) {
    try {
      const lines = readFileSync(file.path, "utf8").trimEnd().split("\n");
      let thinking: ThinkingChoice = unchosenThinking;
      let model: ModelSelectionLookup = { found: false };
      let modelChanges = 0;
      let hasMessage = false;
      for (const line of lines.toReversed()) {
        const entry: unknown = JSON.parse(line);
        if (!Value.Check(SessionEntryTypeSchema, entry)) continue;
        if (entry.type === MESSAGE_ENTRY_TYPE) hasMessage = true;
        if (
          entry.type === THINKING_LEVEL_CHANGE_ENTRY_TYPE &&
          thinking.state === "unchosen" &&
          Value.Check(ThinkingLevelChangeEntrySchema, entry)
        ) {
          thinking = { state: "chosen", level: entry.thinkingLevel };
        }
        if (entry.type === MODEL_CHANGE_ENTRY_TYPE) {
          modelChanges++;
          if (!model.found) model = sessionModelFromEntry(entry);
        }
      }
      if (model.found && (hasMessage || modelChanges > 1)) {
        return { found: true, selection: { ...model.selection, thinking } };
      }
    } catch {
      continue;
    }
  }
  return { found: false };
}

function explicitStartupSelection(): boolean {
  return process.argv
    .slice(2)
    .some(
      (argument) =>
        [
          "--model",
          "--provider",
          "--models",
          "--continue",
          "-c",
          "--resume",
          "-r",
          "--session",
          "--session-id",
          "--fork",
        ].includes(argument) ||
        ["--model=", "--provider=", "--models=", "--session=", "--session-id="].some((prefix) =>
          argument.startsWith(prefix),
        ),
    );
}

export default function lastModelExtension(pi: ExtensionAPI): void {
  let restoring = false;

  // Save before replacing the runtime: the old pi and ctx are invalid afterward.
  pi.on("session_before_switch", (event, ctx) => {
    if (ctx.mode !== TUI_RUNTIME_MODE || event.reason !== NEW_SESSION_REASON || !ctx.model) return;
    saveModel({
      provider: ctx.model.provider,
      id: ctx.model.id,
      thinking: { state: "chosen", level: pi.getThinkingLevel() },
    });
  });

  pi.on("session_start", async (event, ctx) => {
    if (
      ctx.mode !== TUI_RUNTIME_MODE ||
      (event.reason !== STARTUP_SESSION_REASON && event.reason !== NEW_SESSION_REASON)
    ) {
      return;
    }
    if (event.reason === STARTUP_SESSION_REASON && explicitStartupSelection()) return;
    if (
      ctx.sessionManager
        .getEntries()
        .some((entry) => entry.type !== MODEL_CHANGE_ENTRY_TYPE && entry.type !== THINKING_LEVEL_CHANGE_ENTRY_TYPE)
    )
      return;
    const saved = readSavedModel();
    const lookup =
      saved.found || event.reason !== STARTUP_SESSION_REASON
        ? saved
        : recentSessionModel(ctx.sessionManager.getSessionFile());
    if (!lookup.found) return;
    const selection = lookup.selection;
    const model = ctx.modelRegistry.find(selection.provider, selection.id);
    if (!model) return;
    if (
      ctx.scopedModels.length > 0 &&
      !ctx.scopedModels.some(
        (scoped) => scoped.model.provider === selection.provider && scoped.model.id === selection.id,
      )
    )
      return;
    restoring = true;
    try {
      if (await pi.setModel(model)) {
        if (selection.thinking.state === "chosen") pi.setThinkingLevel(selection.thinking.level);
        if (!saved.found) saveModel(selection);
      }
    } finally {
      restoring = false;
    }
  });

  pi.on("model_select", (event, ctx) => {
    if (ctx.mode !== TUI_RUNTIME_MODE || restoring || event.source === "restore") return;
    saveModel({
      provider: event.model.provider,
      id: event.model.id,
      thinking: { state: "chosen", level: pi.getThinkingLevel() },
    });
  });

  pi.on("thinking_level_select", (event, ctx) => {
    if (ctx.mode !== TUI_RUNTIME_MODE || restoring || !ctx.model) return;
    saveModel({
      provider: ctx.model.provider,
      id: ctx.model.id,
      thinking: { state: "chosen", level: event.level },
    });
  });

  pi.on("agent_end", (_event, ctx) => {
    if (ctx.mode !== TUI_RUNTIME_MODE || !ctx.model) return;
    saveModel({
      provider: ctx.model.provider,
      id: ctx.model.id,
      thinking: { state: "chosen", level: pi.getThinkingLevel() },
    });
  });
}
