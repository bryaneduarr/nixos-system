import type { CleanupCheck } from "../../../../types/sessions/cleanup/after-exit/cleanup-check.interface.ts";

export function canCleanup(check: CleanupCheck): boolean {
  const { row, ctx, compacting, userBash } = check;
  if (!row.owned || row.historyEver || compacting || userBash || ctx.signal) return false;
  return ctx.isIdle() && !ctx.hasPendingMessages() && ctx.ui.getEditorText() === "";
}
