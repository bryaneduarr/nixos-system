import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export function listDiscardReasons(ctx: ExtensionContext): string[] {
  const reasons: string[] = [];
  if (!ctx.isIdle() || ctx.signal) reasons.push("active work");
  if (ctx.hasPendingMessages()) reasons.push("pending messages");
  if (ctx.ui.getEditorText() !== "") reasons.push("the editor draft");
  return reasons;
}
