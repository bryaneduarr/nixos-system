import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  USAGE_STATE_MEASURED,
  USAGE_STATE_TOKENS_UNKNOWN,
  USAGE_STATE_UNAVAILABLE,
} from "../../../../constants/sessions/registry/usage-state.constant.ts";
import type { SessionContext } from "../../../../types/sessions/registry/row/session-context.interface.ts";

export function readSessionContext(ctx: ExtensionContext): SessionContext {
  const usage = ctx.getContextUsage();
  if (!usage) return { usageState: USAGE_STATE_UNAVAILABLE };
  if (usage.tokens === null) return { usageState: USAGE_STATE_TOKENS_UNKNOWN, contextWindow: usage.contextWindow };
  if (usage.percent === null) return { usageState: USAGE_STATE_TOKENS_UNKNOWN, contextWindow: usage.contextWindow };
  return {
    usageState: USAGE_STATE_MEASURED,
    tokens: usage.tokens,
    percent: usage.percent,
    contextWindow: usage.contextWindow,
  };
}
