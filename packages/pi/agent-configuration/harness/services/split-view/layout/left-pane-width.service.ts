import {
  LEFT_PANE_WIDTH_RATIO,
  MAX_LEFT_WIDTH,
  MIN_LEFT_WIDTH,
} from "../../../constants/split-view/layout.constant.ts";

export function leftPaneWidth(contentWidth: number): number {
  return Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, Math.round(contentWidth * LEFT_PANE_WIDTH_RATIO)));
}
