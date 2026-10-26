import { DETAIL_SCROLL_TO_END } from "../../../constants/inspector/navigation/scroll.constant.ts";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import type { InspectorNavigation } from "../../../types/inspector/navigation/inspector-navigation.interface.ts";
import type { InspectorNavigationOptions } from "../../../types/inspector/navigation/inspector-navigation-options.interface.ts";
import { rowKey } from "./row-key.service.ts";

export function adjustSubagentCollapse(
  navigation: InspectorNavigation,
  options: InspectorNavigationOptions,
  direction: "left" | "right",
): boolean {
  const lookup = navigation.currentRow();
  if (!lookup.found) return false;
  const entry = lookup.row.entry;
  if (entry.toolName !== TASK_TOOL_NAME || entry.sub.length === 0) return false;

  if (direction === "left") {
    navigation.expandedTasks.delete(entry.id);
    navigation.selection = { kind: "row", id: entry.id };
    navigation.detailScroll = 0;
  } else {
    navigation.expandedTasks.add(entry.id);
    const last = entry.sub.at(-1);
    navigation.selection = { kind: "row", id: last ? rowKey({ level: "sub", entry, sub: last }) : entry.id };
    navigation.detailScroll = DETAIL_SCROLL_TO_END;
  }
  options.changed();
  return true;
}
