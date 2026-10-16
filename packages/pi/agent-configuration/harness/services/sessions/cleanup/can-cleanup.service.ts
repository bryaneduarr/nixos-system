import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";

export function canCleanup(row: LiveSession, ctx: ExtensionContext, compacting: boolean, userBash: boolean): boolean {
  if (!row.owned || row.historyEver || compacting || userBash || ctx.signal) return false;
  return ctx.isIdle() && !ctx.hasPendingMessages() && ctx.ui.getEditorText() === "";
}
