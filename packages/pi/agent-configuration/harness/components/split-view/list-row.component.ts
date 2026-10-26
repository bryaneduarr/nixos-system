import { truncateToWidth } from "@earendil-works/pi-tui";
import { TRUNCATION_MARK } from "../../constants/split-view/text.constant.ts";
import { SELECTED_ROW_BACKGROUND } from "../../constants/split-view/theme-color.constant.ts";
import { padCell } from "../../services/split-view/layout/pad-cell.service.ts";
import type { ListRowOptions } from "../../types/split-view/list-row-options.interface.ts";

export function listRow({ text, width, isSelected, theme }: ListRowOptions): string {
  const cell = padCell(truncateToWidth(text, width, TRUNCATION_MARK, true), width);
  return isSelected ? theme.bg(SELECTED_ROW_BACKGROUND, cell) : cell;
}
