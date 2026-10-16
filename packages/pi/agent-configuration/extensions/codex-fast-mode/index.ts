import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import {
  type Api,
  clampThinkingLevel,
  type Model,
  type SimpleStreamOptions,
  type TranscriptContext,
} from "@earendil-works/pi-ai";
import { stream, streamSimple } from "@earendil-works/pi-ai/api/openai-codex-responses";
import { buildBaseOptions } from "@earendil-works/pi-ai/api/simple-options";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { rainbow } from "pi-powerline-footer/theme.ts";
import { Value } from "typebox/value";
import { loadFastModels, supportsFastMode } from "./capabilities.ts";
import { CODEX_RESPONSES_API, PRIORITY_SERVICE_TIER } from "./constants/codex/codex.constant.ts";
import {
  FAST_MODE_ENTRY_TYPE,
  FAST_MODE_STATUS_KEY,
  OFF_ACTION,
  ON_ACTION,
  STATUS_ACTION,
  TOGGLE_ACTION,
} from "./constants/fast-mode/fast-mode.constant.ts";
import { FastModeStateSchema } from "./schemas/fast-mode/fast-mode-state.schema.ts";
import type { FastModePreferenceLookup } from "./types/fast-mode/fast-mode-state.interface.ts";

const fastLabel = rainbow("fast");

function preferenceFile(): string {
  const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local", "state");
  return join(stateHome, "pi", "codex-fast-mode.json");
}

function readPreference(): FastModePreferenceLookup {
  try {
    const value: unknown = JSON.parse(readFileSync(preferenceFile(), "utf8"));
    if (Value.Check(FastModeStateSchema, value)) return { found: true, enabled: value.enabled };
  } catch {
    return { found: false };
  }
  return { found: false };
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
    ctx.ui.setStatus(FAST_MODE_STATUS_KEY, text);
  }

  function streamWithFastMode(model: Model<Api>, context: TranscriptContext, options?: SimpleStreamOptions) {
    if (model.api !== CODEX_RESPONSES_API) {
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
      serviceTier: PRIORITY_SERVICE_TIER,
    });
  }

  pi.registerProvider("harness-codex-fast", {
    api: CODEX_RESPONSES_API,
    streamSimple: streamWithFastMode,
  });

  function restore(ctx: ExtensionContext): void {
    const preference = readPreference();
    enabled = preference.found ? preference.enabled : false;
    fastModels = loadFastModels();

    if (!preference.found) {
      for (const entry of ctx.sessionManager.getBranch()) {
        if (entry.type !== "custom" || entry.customType !== FAST_MODE_ENTRY_TYPE) continue;
        const data: unknown = entry.data;
        if (Value.Check(FastModeStateSchema, data)) enabled = data.enabled;
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
    pi.appendEntry(FAST_MODE_ENTRY_TYPE, { enabled });
    updateStatus(ctx);
  }

  pi.registerShortcut("ctrl+alt+f", {
    description: "Toggle Codex fast mode",
    handler: async (ctx) => setEnabled(!enabled, ctx),
  });

  pi.registerCommand("fast", {
    description: "Turn Codex fast mode on or off",
    getArgumentCompletions: (prefix) => {
      const items = [ON_ACTION, OFF_ACTION, TOGGLE_ACTION, STATUS_ACTION].filter((item) => item.startsWith(prefix));
      return items.map((item) => ({ value: item, label: item }));
    },
    handler: async (args, ctx) => {
      let action = args.trim().toLowerCase();

      if (!action && ctx.hasUI) {
        const selection = await ctx.ui.select("Codex fast mode", ["On", "Off"]);
        if (!selection) return;
        action = selection.toLowerCase();
      }

      if (!action || action === STATUS_ACTION) {
        updateStatus(ctx);
        ctx.ui.notify(
          `Fast mode is ${enabled ? "on" : "off"}. ${supportsFastMode(ctx.model, fastModels) ? "Current model supports priority." : "Current model does not support priority."}`,
          "info",
        );
        return;
      }

      if (![ON_ACTION, OFF_ACTION, TOGGLE_ACTION].includes(action)) {
        ctx.ui.notify("Use /fast on, off, toggle, or status.", "warning");
        return;
      }

      const nextEnabled = action === ON_ACTION || (action === TOGGLE_ACTION && !enabled);
      setEnabled(nextEnabled, ctx);
    },
  });
}
