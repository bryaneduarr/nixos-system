import { ROW_KEY_SEPARATOR } from "../../../constants/inspector/navigation/row-key.constant.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";

export function rowKey(row: InspectorRow): string {
  return row.level === "sub" ? `${row.entry.id}${ROW_KEY_SEPARATOR}${row.sub.id}` : row.entry.id;
}
