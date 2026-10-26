import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import type { RowSelection } from "../../../types/inspector/navigation/row-selection.interface.ts";
import { rowKey } from "./row-key.service.ts";

export function isRowSelected(row: InspectorRow, selection: RowSelection): boolean {
  return selection.kind === "row" && rowKey(row) === selection.id;
}
