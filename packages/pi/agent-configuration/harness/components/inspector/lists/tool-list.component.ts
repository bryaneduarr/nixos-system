import { isLastChildRow } from "../../../services/inspector/rows/is-last-child-row.service.ts";
import { toolRowText } from "../../../services/inspector/rows/tool-row-text.service.ts";
import { padCell } from "../../../services/split-view/layout/pad-cell.service.ts";
import type { ToolListOptions } from "../../../types/inspector/lists/tool-list-options.interface.ts";
import { listRow } from "../../split-view/list-row.component.ts";

export function renderToolList({
  rows,
  width,
  height,
  scroll,
  selected,
  expandedTasks,
  theme,
}: ToolListOptions): string[] {
  const out: string[] = [];
  for (let index = 0; index < height; index += 1) {
    const row = rows[scroll + index];
    if (!row) {
      out.push(padCell("", width));
      continue;
    }
    const isSelected = scroll + index === selected;
    const isLastChild = isLastChildRow(row, rows, scroll + index);
    const text = toolRowText({ row, expandedTasks, isSelected, isLastChild, theme });
    out.push(listRow({ text, width, isSelected, theme }));
  }
  return out;
}
