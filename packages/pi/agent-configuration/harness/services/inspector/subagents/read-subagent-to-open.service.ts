import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { SubagentSelection } from "../../../types/inspector/subagents/subagent-selection.interface.ts";

export function readSubagentToOpen(
  navigation: Pick<InspectorNavigation, "page" | "subagentSelection" | "currentRow">,
): SubagentSelection {
  if (navigation.page === "subagents") return navigation.subagentSelection;

  const lookup = navigation.currentRow();
  if (!lookup.found || lookup.row.entry.toolName !== TASK_TOOL_NAME) return { kind: "none" };

  return { kind: "selected", id: lookup.row.entry.id };
}
