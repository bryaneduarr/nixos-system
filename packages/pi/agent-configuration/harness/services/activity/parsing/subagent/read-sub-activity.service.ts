import { Value } from "typebox/value";
import { SubToolActivityRecordSchema } from "../../../../schemas/activity/parsing/subagent/sub-tool-activity.schema.ts";
import type { SubToolActivity } from "../../../../types/activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { SubToolActivityRecord } from "../../../../types/activity/parsing/subagent/sub-tool-activity-record.interface.ts";
import { isRecord } from "../../../values/is-record.service.ts";

export function readSubActivity(details: unknown): SubToolActivity[] {
  if (!isRecord(details) || !Array.isArray(details.activity)) return [];
  return details.activity.flatMap((rawActivity: unknown) => {
    if (!Value.Check(SubToolActivityRecordSchema, rawActivity)) return [];
    return [toSubToolActivity(rawActivity)];
  });
}

function toSubToolActivity(record: SubToolActivityRecord): SubToolActivity {
  return {
    id: record.id,
    toolName: record.toolName,
    args: record.args,
    status: record.status,
    text: record.text,
    startedAt: record.startedAt,
    endedAt: record.endedAt === undefined ? { state: "absent" } : { state: "present", value: record.endedAt },
  };
}
