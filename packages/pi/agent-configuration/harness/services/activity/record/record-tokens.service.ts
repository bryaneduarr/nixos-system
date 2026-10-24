import { TOKENS_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { SubagentUsage } from "../../../types/activity/parsing/subagent/subagent-usage.interface.ts";
import type { RecordTurnPartInput } from "../../../types/activity/record/record-turn-part-input.interface.ts";
import { turnUsageLabel } from "../../inspector/labels/usage/turn-usage-label.service.ts";

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
