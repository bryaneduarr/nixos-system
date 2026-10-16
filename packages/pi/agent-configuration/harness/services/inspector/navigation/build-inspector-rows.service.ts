import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../constants/activity/activity-entry.constant.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorPage } from "../../../types/inspector/navigation/inspector-page.interface.ts";
import { activityStore } from "../../activity/store/shared-activity-store.service.ts";

export function buildInspectorRows(page: InspectorPage, expandedTasks: ReadonlySet<string>): InspectorRow[] {
  const rows: InspectorRow[] = [];
  for (const entry of activityStore.all()) {
    const isMessageEntry = entry.toolName === MESSAGE_ACTIVITY_NAME;
    const isPseudoEntry =
      isMessageEntry || entry.toolName === THINKING_ACTIVITY_NAME || entry.toolName === UPDATE_ACTIVITY_NAME;
    const isListed = page === "messages" ? isMessageEntry : !isPseudoEntry;
    if (!isListed) continue;

    rows.push({ level: "entry", entry });
    if (!expandedTasks.has(entry.id)) continue;
    for (const sub of entry.sub) rows.push({ level: "sub", entry, sub });
  }
  return rows;
}
