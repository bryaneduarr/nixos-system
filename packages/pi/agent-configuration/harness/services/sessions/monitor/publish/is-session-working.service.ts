import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export function isSessionWorking(ctx: ExtensionContext, compacting: boolean): boolean {
  const isAgentBusy = !ctx.isIdle();
  const hasQueuedMessages = ctx.hasPendingMessages();
  const hasActiveSignal = ctx.signal !== undefined;
  return isAgentBusy || hasQueuedMessages || compacting || hasActiveSignal;
}
