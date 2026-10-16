import type { ExitContext } from "../../../types/sessions/exit/exit-context.interface.ts";

export async function confirmAdditionalDiscard(ctx: ExitContext, reasons: readonly string[]): Promise<boolean> {
  if (reasons.length === 0) return true;
  return ctx.ui.confirm("Exit Pi?", `Also discard ${reasons.join(", ")}?`);
}
