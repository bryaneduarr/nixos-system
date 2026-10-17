import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { NEW_SESSION_REASON, TUI_RUNTIME_MODE } from "../../../constants/runtime/runtime.constant.ts";
import type { ModelSelection } from "../../../types/model-selection/model-selection.interface.ts";
import { restoreSavedModel } from "../restore-saved-model.service.ts";
import { saveModel } from "../save-model.service.ts";

function selectionWithCurrentThinking(
  pi: ExtensionAPI,
  model: { readonly provider: string; readonly id: string },
): ModelSelection {
  return { provider: model.provider, id: model.id, thinking: { state: "chosen", level: pi.getThinkingLevel() } };
}

function isTuiSession(ctx: ExtensionContext): boolean {
  return ctx.mode === TUI_RUNTIME_MODE;
}

export function installModelSelectionEvents(pi: ExtensionAPI): void {
  let restoring = false;

  // Save before replacing the runtime: the old pi and ctx are invalid afterward.
  pi.on("session_before_switch", (event, ctx) => {
    if (!isTuiSession(ctx) || event.reason !== NEW_SESSION_REASON || !ctx.model) return;
    saveModel(selectionWithCurrentThinking(pi, ctx.model));
  });

  pi.on("session_start", async (event, ctx) => {
    restoring = true;
    try {
      await restoreSavedModel(pi, event, ctx);
    } finally {
      restoring = false;
    }
  });

  pi.on("model_select", (event, ctx) => {
    if (!isTuiSession(ctx) || restoring || event.source === "restore") return;
    saveModel(selectionWithCurrentThinking(pi, event.model));
  });

  pi.on("thinking_level_select", (event, ctx) => {
    if (!isTuiSession(ctx) || restoring || !ctx.model) return;
    saveModel({ provider: ctx.model.provider, id: ctx.model.id, thinking: { state: "chosen", level: event.level } });
  });

  pi.on("agent_end", (_event, ctx) => {
    if (!isTuiSession(ctx) || !ctx.model) return;
    saveModel(selectionWithCurrentThinking(pi, ctx.model));
  });
}
