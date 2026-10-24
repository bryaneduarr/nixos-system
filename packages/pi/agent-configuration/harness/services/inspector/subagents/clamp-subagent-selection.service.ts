import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import type { SubagentSelection } from "../../../types/inspector/subagents/subagent-selection.interface.ts";
import { isSubagentSelected } from "./is-subagent-selected.service.ts";

export function clampSubagentSelection(
  subagents: readonly ToolActivity[],
  selection: SubagentSelection,
): SubagentSelection {
  if (subagents.some((row) => isSubagentSelected(row, selection))) return selection;
  const lastSubagent = subagents.at(-1);
  return lastSubagent ? { kind: "selected", id: lastSubagent.id } : { kind: "none" };
}
