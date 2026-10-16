import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export async function confirmAdditionalDiscard(ctx: ExtensionContext, reasons: readonly string[]): Promise<boolean> {
  if (reasons.length === 0) return true;
  return ctx.ui.confirm("Exit Pi?", `Also discard ${reasons.join(", ")}?`);
}
