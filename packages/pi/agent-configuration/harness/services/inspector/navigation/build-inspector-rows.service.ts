import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorPage } from "../../../types/inspector/navigation/inspector-page.interface.ts";
import type { InspectorRowsOptions } from "../../../types/inspector/navigation/inspector-rows-options.interface.ts";
import type { SubagentSelection } from "../../../types/inspector/subagents/subagent-selection.interface.ts";
import { isToolCallEntry } from "../entries/is-tool-call-entry.service.ts";
import { isSubagentSelected } from "../subagents/is-subagent-selected.service.ts";

export function buildInspectorRows({ page, expandedTasks, openedSubagent }: InspectorRowsOptions): InspectorRow[] {
  if (page === "subagent") return openedSubagentRows(openedSubagent);

  const rows: InspectorRow[] = [];
  for (const entry of activityStore.all()) {
    if (!isListedOnPage(page, entry)) continue;

    rows.push({ level: "entry", entry });
    if (!expandedTasks.has(entry.id)) continue;
    for (const sub of entry.sub) rows.push({ level: "sub", entry, sub });
  }
  return rows;
}

function openedSubagentRows(openedSubagent: SubagentSelection): InspectorRow[] {
  const entry = activityStore.all().find((candidate) => isSubagentSelected(candidate, openedSubagent));
  if (!entry) return [];
  return [{ level: "entry", entry }, ...entry.sub.map((sub): InspectorRow => ({ level: "sub", entry, sub }))];
}

function isListedOnPage(page: Exclude<InspectorPage, "subagent">, entry: ToolActivity): boolean {
  switch (page) {
    case "history":
      return !isToolCallEntry(entry.toolName) && entry.toolName !== MESSAGE_ACTIVITY_NAME;
    case "tools":
    case "subagents":
      return isToolCallEntry(entry.toolName);
  }
}
