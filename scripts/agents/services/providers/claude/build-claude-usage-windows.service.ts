import {
  CLAUDE_SESSION_KIND,
  CLAUDE_SESSION_LABEL,
  CLAUDE_WEEKLY_KIND,
  CLAUDE_WEEKLY_LABEL,
  CLAUDE_WEEKLY_SCOPED_KIND,
} from "../../../constants/providers/claude/claude-provider.constant.ts";
import type { ClaudeUsageLimit } from "../../../types/providers/claude/claude-usage-response.interface.ts";
import type { UsageWindow } from "../../../types/usage/provider-usage.interface.ts";
import { convertUsedToRemainingPercent } from "../../usage/remaining-percent/convert-used-to-remaining-percent.service.ts";

function describeLimitLabel(limit: ClaudeUsageLimit): string {
  if (limit.kind === CLAUDE_SESSION_KIND) return CLAUDE_SESSION_LABEL;
  if (limit.kind === CLAUDE_WEEKLY_KIND) return CLAUDE_WEEKLY_LABEL;
  if (limit.kind === CLAUDE_WEEKLY_SCOPED_KIND && limit.scope.state === "model") {
    return `${CLAUDE_WEEKLY_LABEL} ${limit.scope.modelName}`;
  }
  return limit.kind;
}

export function buildClaudeUsageWindows(limits: readonly ClaudeUsageLimit[]): readonly UsageWindow[] {
  return limits.map((limit) => ({
    label: describeLimitLabel(limit),
    percentRemaining: convertUsedToRemainingPercent(limit.percent),
    resetsAt: new Date(limit.resets_at).toISOString(),
  }));
}
