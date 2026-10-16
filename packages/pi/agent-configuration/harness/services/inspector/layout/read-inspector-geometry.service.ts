import {
  MIN_STACKED_DETAIL_HEIGHT,
  MIN_STACKED_LIST_HEIGHT,
  MIN_TWO_PANE_WIDTH,
  PANE_DIVIDER_WIDTH,
  STACKED_LIST_HEIGHT_RATIO,
} from "../../../constants/inspector/layout.constant.ts";
import type { InspectorGeometry } from "../../../types/inspector/view/inspector-geometry.interface.ts";
import { bodyHeight } from "./body-height.service.ts";
import { leftPaneWidth } from "./left-pane-width.service.ts";

export function readInspectorGeometry(width: number, terminalRows: number): InspectorGeometry {
  const height = bodyHeight(terminalRows);
  const twoPane = width >= MIN_TWO_PANE_WIDTH;
  const contentWidth = Math.max(8, width - 4);
  const leftWidth = twoPane ? leftPaneWidth(contentWidth) : contentWidth;
  const rightWidth = twoPane ? Math.max(1, contentWidth - leftWidth - PANE_DIVIDER_WIDTH) : contentWidth;
  const listHeight = twoPane
    ? height
    : Math.max(MIN_STACKED_LIST_HEIGHT, Math.floor((height - 1) * STACKED_LIST_HEIGHT_RATIO));
  const detailHeight = twoPane ? height : Math.max(MIN_STACKED_DETAIL_HEIGHT, height - listHeight - 1);
  return { height, twoPane, contentWidth, leftWidth, rightWidth, listHeight, detailHeight };
}
