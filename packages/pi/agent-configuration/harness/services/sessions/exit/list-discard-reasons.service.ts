import type { ExitContext } from "../../../types/sessions/exit/exit-context.interface.ts";

export function listDiscardReasons(ctx: ExitContext): string[] {
  const reasons: string[] = [];
  if (!ctx.isIdle() || ctx.signal) reasons.push("active work");
  if (ctx.hasPendingMessages()) reasons.push("pending messages");
  if (ctx.ui.getEditorText() !== "") reasons.push("the editor draft");
  return reasons;
}
