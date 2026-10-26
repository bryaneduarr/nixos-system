import { EXIT_CONFIRM_TITLE } from "../../../constants/sessions/exit/exit.constant.ts";
import type { ExitContext } from "../../../types/sessions/exit/exit-context.interface.ts";

export async function confirmExit(ctx: ExitContext, reasons: readonly string[]): Promise<boolean> {
  if (reasons.length === 0) return true;
  return ctx.ui.confirm(EXIT_CONFIRM_TITLE, `Discard ${reasons.join(", ")}? The saved conversation is kept.`);
}
