import { TOKENS_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import type { SubagentUsage } from "../../../types/activity/parsing/subagent/subagent-usage.interface.ts";
import type { RecordTurnPartInput } from "../../../types/activity/record/record-turn-part-input.interface.ts";
import { turnUsageLabel } from "../../inspector/labels/usage/turn-usage-label.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function recordTokens(input: RecordTurnPartInput, usage: SubagentUsage): void {
  const { id, cwd, startedAt, endedAt } = input;
  activityStore.begin({ id, toolName: TOKENS_ACTIVITY_NAME, args: {}, cwd, startedAt });
  activityStore.finish(id, {
    ...NO_TOOL_RESULT_FIELDS,
    usage: { usageState: "reported", usage },
    text: turnUsageLabel(usage),
    status: "success",
    endedAt,
  });
}
