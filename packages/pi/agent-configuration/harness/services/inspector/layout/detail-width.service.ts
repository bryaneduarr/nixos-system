import { MIN_TWO_PANE_WIDTH, PANE_DIVIDER_WIDTH } from "../../../constants/inspector/layout.constant.ts";
import { leftPaneWidth } from "./left-pane-width.service.ts";

export function detailWidth(width: number): number {
  const contentWidth = Math.max(8, width - 4);
  if (width < MIN_TWO_PANE_WIDTH) return contentWidth;

  return Math.max(1, contentWidth - leftPaneWidth(contentWidth) - PANE_DIVIDER_WIDTH);
}
