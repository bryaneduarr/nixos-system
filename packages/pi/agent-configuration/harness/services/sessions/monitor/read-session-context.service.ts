import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SessionContext } from "../../../types/sessions/registry/session-context.interface.ts";

export function readSessionContext(ctx: ExtensionContext): SessionContext {
  const usage = ctx.getContextUsage();
  if (!usage) return { usageState: "unavailable" };
  if (usage.tokens === null) return { usageState: "tokens-unknown", contextWindow: usage.contextWindow };
  if (usage.percent === null) return { usageState: "tokens-unknown", contextWindow: usage.contextWindow };
  return { usageState: "measured", tokens: usage.tokens, percent: usage.percent, contextWindow: usage.contextWindow };
}
