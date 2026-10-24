import type { CleanupContext } from "../../../../types/sessions/cleanup/after-exit/cleanup-context.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";

export function canCleanup(row: LiveSession, ctx: CleanupContext, compacting: boolean, userBash: boolean): boolean {
  if (!row.owned || row.historyEver || compacting || userBash || ctx.signal) return false;
  return ctx.isIdle() && !ctx.hasPendingMessages() && ctx.ui.getEditorText() === "";
}
