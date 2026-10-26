import { truncateToWidth } from "@earendil-works/pi-tui";
import { STACKED_DETAIL_TITLE, VERTICAL_RULE } from "../../constants/split-view/text.constant.ts";
import { BORDER_COLOR, THEME_ACCENT, THEME_MUTED } from "../../constants/split-view/theme-color.constant.ts";
import { padCell } from "../../services/split-view/layout/pad-cell.service.ts";
import type { SplitPanesOptions } from "../../types/split-view/split-panes-options.interface.ts";

function fillRows(lines: readonly string[], count: number, width: number): string[] {
  const filled = lines.slice(0, count).map((line) => padCell(truncateToWidth(line, width, "", true), width));
  const blankRows = Array.from({ length: count - filled.length }, () => padCell("", width));
  return [...filled, ...blankRows];
}

export function splitPanes({ list, detail, geometry, focus, theme }: SplitPanesOptions): string[] {
  const listRows = fillRows(list, geometry.listHeight, geometry.leftWidth);
  const detailRows = fillRows(detail, geometry.detailHeight, geometry.rightWidth);

  if (!geometry.twoPane) {
    const detailTitle = theme.bold(theme.fg(focus === "detail" ? THEME_ACCENT : THEME_MUTED, STACKED_DETAIL_TITLE));
    return [...listRows, detailTitle, ...detailRows];
  }
  const divider = theme.fg(focus === "detail" ? THEME_ACCENT : BORDER_COLOR, VERTICAL_RULE);
  return listRows.map((listRow, index) => {
    const detailRow = detailRows[index];
    return detailRow === undefined ? `${listRow} ${divider} ` : `${listRow} ${divider} ${detailRow}`;
  });
}
