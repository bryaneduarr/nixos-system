import type { ToolResultFields } from "../../../types/activity/parsing/tool-result/tool-result-fields.interface.ts";

/** Result fields that leave a recorded tool call unchanged, for text-only entries. */
export const NO_TOOL_RESULT_FIELDS: ToolResultFields = {
  details: { state: "absent" },
  sub: [],
  usage: { usageState: "unreported" },
  model: { state: "absent" },
  thinkingLevel: { state: "absent" },
};
