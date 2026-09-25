import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

interface SavedModel {
  provider: string;
  id: string;
  thinkingLevel?: ReturnType<ExtensionAPI["getThinkingLevel"]>;
}

const stateDirectory = join(
  process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"),
  "pi",
);
const stateFile = join(stateDirectory, "last-model.json");
const thinkingLevels = new Set([
  "off", "minimal", "low", "medium", "high", "xhigh", "max",
]);

function isThinkingLevel(value: unknown): value is ReturnType<ExtensionAPI["getThinkingLevel"]> {
  return typeof value === "string" && thinkingLevels.has(value);
}

function savedModel(value: unknown): SavedModel | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  if (!("provider" in value) || typeof value.provider !== "string") return undefined;
  if (!("id" in value) || typeof value.id !== "string") return undefined;
  if (!value.provider || !value.id) return undefined;
  const thinkingLevel = "thinkingLevel" in value && isThinkingLevel(value.thinkingLevel)
    ? value.thinkingLevel
    : undefined;
  return { provider: value.provider, id: value.id, thinkingLevel };
}

function readSavedModel(): SavedModel | undefined {
  try {
    return savedModel(JSON.parse(readFileSync(stateFile, "utf8")));
  } catch {
    return undefined;
  }
}

function saveModel(model: SavedModel): void {
  mkdirSync(stateDirectory, { recursive: true });
  const temporary = `${stateFile}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(model)}\n`, { mode: 0o600 });
  renameSync(temporary, stateFile);
}

// On the first launch after installation, use the most recently used session.
function recentSessionModel(currentSessionFile: string | undefined): SavedModel | undefined {
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
    return undefined;
  }
  files.sort((a, b) => b.modified - a.modified);
  for (const file of files) {
    try {
      const lines = readFileSync(file.path, "utf8").trimEnd().split("\n");
      let thinkingLevel: SavedModel["thinkingLevel"];
      let model: SavedModel | undefined;
      let modelChanges = 0;
      let hasMessage = false;
      for (let index = lines.length - 1; index >= 0; index--) {
        const entry: unknown = JSON.parse(lines[index]);
        if (typeof entry !== "object" || entry === null || !("type" in entry)) continue;
        if (entry.type === "message") hasMessage = true;
        if (entry.type === "thinking_level_change" && thinkingLevel === undefined &&
            "thinkingLevel" in entry && isThinkingLevel(entry.thinkingLevel)) {
          thinkingLevel = entry.thinkingLevel;
        }
        if (entry.type === "model_change") {
          modelChanges++;
          if (!model && "modelId" in entry) {
            model = savedModel({
              ...entry,
              id: entry.modelId,
            });
          }
        }
      }
      if (model && (hasMessage || modelChanges > 1)) return { ...model, thinkingLevel };
    } catch {
      continue;
    }
  }
  return undefined;
}

function explicitStartupSelection(): boolean {
  return process.argv.slice(2).some((argument) =>
    ["--model", "--provider", "--models", "--continue", "-c", "--resume", "-r", "--session", "--session-id", "--fork"].includes(argument) ||
    ["--model=", "--provider=", "--models=", "--session=", "--session-id="].some((prefix) => argument.startsWith(prefix))
  );
}

export default function lastModelExtension(pi: ExtensionAPI): void {
  let restoring = false;

  // Save before replacing the runtime: the old pi and ctx are invalid afterward.
  pi.on("session_before_switch", (event, ctx) => {
    if (ctx.mode !== "tui" || event.reason !== "new" || !ctx.model) return;
    saveModel({
      provider: ctx.model.provider,
      id: ctx.model.id,
      thinkingLevel: pi.getThinkingLevel(),
    });
  });

  pi.on("session_start", async (event, ctx) => {
    if (ctx.mode !== "tui" || (event.reason !== "startup" && event.reason !== "new")) return;
    if (event.reason === "startup" && explicitStartupSelection()) return;
    if (ctx.sessionManager.getEntries().some((entry) =>
      entry.type !== "model_change" && entry.type !== "thinking_level_change"
    )) return;
    const saved = readSavedModel();
    const selection = saved ?? (event.reason === "startup"
      ? recentSessionModel(ctx.sessionManager.getSessionFile())
      : undefined);
    if (!selection) return;
    const model = ctx.modelRegistry.find(selection.provider, selection.id);
    if (!model) return;
    if (ctx.scopedModels.length > 0 && !ctx.scopedModels.some(
      (scoped) => scoped.model.provider === selection.provider && scoped.model.id === selection.id,
    )) return;
    restoring = true;
    try {
      if (await pi.setModel(model)) {
        if (selection.thinkingLevel) pi.setThinkingLevel(selection.thinkingLevel);
        if (!saved) saveModel(selection);
      }
    } finally {
      restoring = false;
    }
  });

  pi.on("model_select", (event, ctx) => {
    if (ctx.mode !== "tui" || restoring || event.source === "restore") return;
    saveModel({
      provider: event.model.provider,
      id: event.model.id,
      thinkingLevel: pi.getThinkingLevel(),
    });
  });

  pi.on("thinking_level_select", (event, ctx) => {
    if (ctx.mode !== "tui" || restoring || !ctx.model) return;
    saveModel({
      provider: ctx.model.provider,
      id: ctx.model.id,
      thinkingLevel: event.level,
    });
  });

  pi.on("agent_end", (_event, ctx) => {
    if (ctx.mode !== "tui" || !ctx.model) return;
    saveModel({
      provider: ctx.model.provider,
      id: ctx.model.id,
      thinkingLevel: pi.getThinkingLevel(),
    });
  });
}
