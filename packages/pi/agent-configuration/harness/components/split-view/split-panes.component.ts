import { truncateToWidth } from "@earendil-works/pi-tui";
import { STACKED_DETAIL_TITLE, VERTICAL_RULE } from "../../constants/split-view/text.constant.ts";
import { BORDER_COLOR } from "../../constants/split-view/theme-color.constant.ts";
import { padCell } from "../../services/split-view/layout/pad-cell.service.ts";
import type { SplitPanesOptions } from "../../types/split-view/split-panes-options.interface.ts";

function fillRows(lines: readonly string[], count: number, width: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    padCell(truncateToWidth(lines[index] ?? "", width, "", true), width),
  );
}

export function splitPanes({ list, detail, geometry, focus, theme }: SplitPanesOptions): string[] {
  const listRows = fillRows(list, geometry.listHeight, geometry.leftWidth);
  const detailRows = fillRows(detail, geometry.detailHeight, geometry.rightWidth);

  if (!geometry.twoPane) {
    const detailTitle = theme.bold(theme.fg(focus === "detail" ? "accent" : "muted", STACKED_DETAIL_TITLE));
    return [...listRows, detailTitle, ...detailRows];
  }
  const divider = theme.fg(focus === "detail" ? "accent" : BORDER_COLOR, VERTICAL_RULE);
  return listRows.map((listRow, index) => `${listRow} ${divider} ${detailRows[index] ?? ""}`);
}
