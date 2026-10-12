import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { clampThinkingLevel, type Api, type Model, type SimpleStreamOptions, type TranscriptContext } from "@earendil-works/pi-ai";
import { stream, streamSimple } from "@earendil-works/pi-ai/api/openai-codex-responses";
import { buildBaseOptions } from "@earendil-works/pi-ai/api/simple-options";
import { loadFastModels, supportsFastMode } from "./capabilities.ts";

const statusKey = "codex-fast-mode";
const entryType = "codex-fast-mode";
const rainbowColors = [196, 220, 46, 39];
const fastLabel = [..."fast"]
  .map((letter, index) => `\u001b[38;5;${rainbowColors[index]}m${letter}`)
  .join("") + "\u001b[39m";

function preferenceFile(): string {
  const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local", "state");
  return join(stateHome, "pi", "codex-fast-mode.json");
}

function readPreference(): boolean | undefined {
  try {
    const value: unknown = JSON.parse(readFileSync(preferenceFile(), "utf8"));
    if (value && typeof value === "object" && "enabled" in value && typeof value.enabled === "boolean") {
      return value.enabled;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function savePreference(enabled: boolean): void {
  const file = preferenceFile();
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  const directory = dirname(file);
  mkdirSync(directory, { recursive: true });
  writeFileSync(temporary, `${JSON.stringify({ enabled })}\n`, { mode: 0o600 });
  renameSync(temporary, file);
}

export default function codexFastMode(pi: ExtensionAPI): void {
  let enabled = false;
  let fastModels = loadFastModels();

  function updateStatus(ctx: ExtensionContext): void {
    if (!ctx.hasUI) return;
    const eligible = supportsFastMode(ctx.model, fastModels);
    const text = enabled && eligible ? fastLabel : undefined;
    ctx.ui.setStatus(statusKey, text);
  }

  function streamWithFastMode(model: Model<Api>, context: TranscriptContext, options?: SimpleStreamOptions) {
    if (model.api !== "openai-codex-responses") {
      throw new Error(`Expected Codex Responses API, received ${model.api}`);
    }
    const codexModel = model as Model<"openai-codex-responses">;

    if (!enabled || !supportsFastMode(model, fastModels)) {
      return streamSimple(codexModel, context, options);
    }
    if (!options?.apiKey) throw new Error(`No API key for provider: ${model.provider}`);

    const baseOptions = buildBaseOptions(model, context, options, options.apiKey);
    const thinkingLevel = options.reasoning ? clampThinkingLevel(model, options.reasoning) : undefined;
    const reasoningEffort = thinkingLevel === "off" ? undefined : thinkingLevel;

    return stream(codexModel, context, {
      ...baseOptions,
      toolChoice: options.toolChoice,
      reasoningEffort,
      serviceTier: "priority",
    });
  }

  pi.registerProvider("harness-codex-fast", {
    api: "openai-codex-responses",
    streamSimple: streamWithFastMode,
  });

  function restore(ctx: ExtensionContext): void {
    const preference = readPreference();
    enabled = preference ?? false;
    fastModels = loadFastModels();

    if (preference === undefined) {
      for (const entry of ctx.sessionManager.getBranch()) {
        if (entry.type !== "custom" || entry.customType !== entryType) continue;
        const data = entry.data;
        if (data && typeof data === "object" && "enabled" in data && typeof data.enabled === "boolean") {
          enabled = data.enabled;
        }
      }
    }

    updateStatus(ctx);
  }

  pi.on("session_start", (_event, ctx) => restore(ctx));
  pi.on("session_tree", (_event, ctx) => updateStatus(ctx));
  pi.on("model_select", (_event, ctx) => updateStatus(ctx));

  function setEnabled(nextEnabled: boolean, ctx: ExtensionContext): void {
    if (nextEnabled && !supportsFastMode(ctx.model, fastModels)) {
      ctx.ui.notify("Fast mode is unavailable for this model. Select a supported openai-codex model first.", "warning");
      return;
    }

    try {
      savePreference(nextEnabled);
    } catch {
      ctx.ui.notify("Could not save the fast-mode preference. Fast mode was not changed.", "error");
      return;
    }

    enabled = nextEnabled;
    pi.appendEntry(entryType, { enabled });
    updateStatus(ctx);
  }

  pi.registerShortcut("ctrl+alt+f", {
    description: "Toggle Codex fast mode",
    handler: async (ctx) => setEnabled(!enabled, ctx),
  });

  pi.registerCommand("fast", {
    description: "Turn Codex fast mode on or off",
    getArgumentCompletions: (prefix) => {
      const items = ["on", "off", "toggle", "status"].filter((item) => item.startsWith(prefix));
      return items.map((item) => ({ value: item, label: item }));
    },
    handler: async (args, ctx) => {
      let action = args.trim().toLowerCase();

      if (!action && ctx.hasUI) {
        const selection = await ctx.ui.select("Codex fast mode", ["On", "Off"]);
        if (!selection) return;
        action = selection.toLowerCase();
      }

      if (!action || action === "status") {
        updateStatus(ctx);
        ctx.ui.notify(`Fast mode is ${enabled ? "on" : "off"}. ${supportsFastMode(ctx.model, fastModels) ? "Current model supports priority." : "Current model does not support priority."}`, "info");
        return;
      }

      if (!["on", "off", "toggle"].includes(action)) {
        ctx.ui.notify("Use /fast on, off, toggle, or status.", "warning");
        return;
      }

      const nextEnabled = action === "on" || (action === "toggle" && !enabled);
      setEnabled(nextEnabled, ctx);
    },
  });
}
