import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { clampThinkingLevel, type Api, type Model, type SimpleStreamOptions, type TranscriptContext } from "@earendil-works/pi-ai";
import { stream, streamSimple } from "@earendil-works/pi-ai/api/openai-codex-responses";
import { buildBaseOptions } from "@earendil-works/pi-ai/api/simple-options";
import { loadFastModels, supportsFastMode } from "./capabilities.ts";

const statusKey = "codex-fast-mode";
const entryType = "codex-fast-mode";

export default function codexFastMode(pi: ExtensionAPI): void {
  let enabled = false;
  let fastModels = loadFastModels();

  function updateStatus(ctx: ExtensionContext): void {
    if (!ctx.hasUI) return;
    const eligible = supportsFastMode(ctx.model, fastModels);
    const text = eligible ? `/fast: ${enabled ? "on" : "off"}` : "/fast: unavailable";
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
    enabled = false;
    fastModels = loadFastModels();

    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type !== "custom" || entry.customType !== entryType) continue;
      const data = entry.data;
      if (data && typeof data === "object" && "enabled" in data && typeof data.enabled === "boolean") {
        enabled = data.enabled;
      }
    }

    updateStatus(ctx);
  }

  pi.on("session_start", (_event, ctx) => restore(ctx));
  pi.on("session_tree", (_event, ctx) => restore(ctx));
  pi.on("model_select", (_event, ctx) => updateStatus(ctx));

  pi.registerCommand("fast", {
    description: "Turn Codex fast mode on or off, with increased usage",
    getArgumentCompletions: (prefix) => {
      const items = ["on", "off", "toggle", "status"].filter((item) => item.startsWith(prefix));
      return items.map((item) => ({ value: item, label: item }));
    },
    handler: async (args, ctx) => {
      let action = args.trim().toLowerCase();

      if (!action && ctx.hasUI) {
        const selection = await ctx.ui.select("Codex fast mode uses priority service and increases usage", ["On", "Off"]);
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
      if (nextEnabled && !supportsFastMode(ctx.model, fastModels)) {
        ctx.ui.notify("Fast mode is unavailable for this model. Select a supported openai-codex model first.", "warning");
        return;
      }

      enabled = nextEnabled;
      pi.appendEntry(entryType, { enabled });
      updateStatus(ctx);
      ctx.ui.notify(`Codex fast mode ${enabled ? "on. Priority service increases usage." : "off."}`, "info");
    },
  });
}
