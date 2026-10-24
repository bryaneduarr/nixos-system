import type { Static } from "typebox";
import type { SubToolActivityRecordSchema } from "../../../../schemas/activity/parsing/subagent/sub-tool-activity.schema.ts";

/** A nested worker tool call as read from a tool result, before its optional end time is converted. */
export type SubToolActivityRecord = Static<typeof SubToolActivityRecordSchema>;
