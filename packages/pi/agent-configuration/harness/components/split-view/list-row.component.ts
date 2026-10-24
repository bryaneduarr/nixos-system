import { truncateToWidth } from "@earendil-works/pi-tui";
import { TRUNCATION_MARK } from "../../constants/split-view/text.constant.ts";
import { SELECTED_ROW_BACKGROUND } from "../../constants/split-view/theme-color.constant.ts";
import { padCell } from "../../services/split-view/layout/pad-cell.service.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";

export function listRow(text: string, width: number, isSelected: boolean, theme: Pick<SplitViewTheme, "bg">): string {
  const cell = padCell(truncateToWidth(text, width, TRUNCATION_MARK, true), width);
  return isSelected ? theme.bg(SELECTED_ROW_BACKGROUND, cell) : cell;
}
