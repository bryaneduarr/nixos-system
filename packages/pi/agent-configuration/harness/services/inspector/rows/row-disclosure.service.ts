import { TWO_SPACES } from "../../../constants/inspector/lists/spacing.constant.ts";
import {
  CHILD_DISCLOSURE,
  COLLAPSED_DISCLOSURE,
  EXPANDED_DISCLOSURE,
  LAST_CHILD_DISCLOSURE,
} from "../../../constants/inspector/rows/disclosure.constant.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";

export function rowDisclosure(row: InspectorRow, expandedTasks: ReadonlySet<string>, isLastChild: boolean): string {
  if (row.level === "sub") return isLastChild ? LAST_CHILD_DISCLOSURE : CHILD_DISCLOSURE;
  if (row.entry.sub.length === 0) return TWO_SPACES;
  return expandedTasks.has(row.entry.id) ? EXPANDED_DISCLOSURE : COLLAPSED_DISCLOSURE;
}
