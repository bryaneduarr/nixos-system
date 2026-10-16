import type { ExtensionAPI, ExtensionContext, SessionStartEvent } from "@earendil-works/pi-coding-agent";
import {
  NEW_SESSION_REASON,
  STARTUP_SESSION_REASON,
  TUI_RUNTIME_MODE,
} from "../../constants/runtime/runtime.constant.ts";
import {
  MODEL_CHANGE_ENTRY_TYPE,
  THINKING_LEVEL_CHANGE_ENTRY_TYPE,
} from "../../constants/session-history/session-entry-type.constant.ts";
import type { ModelSelection } from "../../types/model-selection/model-selection.interface.ts";
import type { ExcludedSessionFile } from "../../types/session-history/session-file.interface.ts";
import { recentSessionModel } from "../session-history/recent-session-model.service.ts";
import { hasExplicitStartupSelection } from "./has-explicit-startup-selection.service.ts";
import { readSavedModel } from "./read-saved-model.service.ts";
import { saveModel } from "./save-model.service.ts";

function hasSessionContent(ctx: ExtensionContext): boolean {
  return ctx.sessionManager
    .getEntries()
    .some((entry) => entry.type !== MODEL_CHANGE_ENTRY_TYPE && entry.type !== THINKING_LEVEL_CHANGE_ENTRY_TYPE);
}

function isInScope(ctx: ExtensionContext, selection: ModelSelection): boolean {
  return (
    ctx.scopedModels.length === 0 ||
    ctx.scopedModels.some((scoped) => scoped.model.provider === selection.provider && scoped.model.id === selection.id)
  );
}

function excludedSessionFile(ctx: ExtensionContext): ExcludedSessionFile {
  const sessionFile = ctx.sessionManager.getSessionFile();
  return sessionFile === undefined ? { state: "none" } : { state: "excluded", path: sessionFile };
}

function isRestoreEligible(event: SessionStartEvent, ctx: ExtensionContext): boolean {
  const isTuiStartupOrNew =
    ctx.mode === TUI_RUNTIME_MODE && (event.reason === STARTUP_SESSION_REASON || event.reason === NEW_SESSION_REASON);
  const isExplicitStartup = event.reason === STARTUP_SESSION_REASON && hasExplicitStartupSelection();
  return isTuiStartupOrNew && !isExplicitStartup && !hasSessionContent(ctx);
}

export async function restoreSavedModel(
  pi: ExtensionAPI,
  event: SessionStartEvent,
  ctx: ExtensionContext,
): Promise<void> {
  if (!isRestoreEligible(event, ctx)) return;

  const saved = readSavedModel();
  const usesSavedModel = saved.found || event.reason !== STARTUP_SESSION_REASON;
  // Without a saved model, the first startup after installation uses the most recent session.
  const lookup = usesSavedModel ? saved : recentSessionModel(excludedSessionFile(ctx));
  if (!lookup.found) return;
  const selection = lookup.selection;
  const model = ctx.modelRegistry.find(selection.provider, selection.id);
  if (!model || !isInScope(ctx, selection)) return;

  if (await pi.setModel(model)) {
    if (selection.thinking.state === "chosen") pi.setThinkingLevel(selection.thinking.level);
    if (!saved.found) saveModel(selection);
  }
}
