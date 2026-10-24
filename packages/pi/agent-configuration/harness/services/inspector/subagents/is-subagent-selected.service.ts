import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import type { SubagentSelection } from "../../../types/inspector/subagents/subagent-selection.interface.ts";

export function isSubagentSelected(row: ToolActivity, selection: SubagentSelection): boolean {
  return selection.kind === "selected" && row.id === selection.id;
}
