import { FRAME_CHROME_WIDTH } from "../../../constants/split-view/frame.constant.ts";
import {
  DETAIL_TITLE_ROWS,
  MIN_CONTENT_WIDTH,
  MIN_STACKED_DETAIL_HEIGHT,
  MIN_STACKED_LIST_HEIGHT,
  MIN_TWO_PANE_WIDTH,
  PANE_DIVIDER_WIDTH,
  STACKED_LIST_HEIGHT_RATIO,
} from "../../../constants/split-view/layout.constant.ts";
import type { SplitViewGeometry } from "../../../types/split-view/split-view-geometry.interface.ts";
import { bodyHeight } from "./body-height.service.ts";
import { leftPaneWidth } from "./left-pane-width.service.ts";

export function readSplitViewGeometry(width: number, terminalRows: number): SplitViewGeometry {
  const height = bodyHeight(terminalRows);
  const twoPane = width >= MIN_TWO_PANE_WIDTH;
  const contentWidth = Math.max(MIN_CONTENT_WIDTH, width - FRAME_CHROME_WIDTH);
  const leftWidth = twoPane ? leftPaneWidth(contentWidth) : contentWidth;
  const rightWidth = twoPane ? Math.max(1, contentWidth - leftWidth - PANE_DIVIDER_WIDTH) : contentWidth;
  const listHeight = twoPane
    ? height
    : Math.max(MIN_STACKED_LIST_HEIGHT, Math.floor((height - DETAIL_TITLE_ROWS) * STACKED_LIST_HEIGHT_RATIO));
  const detailHeight = twoPane ? height : Math.max(MIN_STACKED_DETAIL_HEIGHT, height - listHeight - DETAIL_TITLE_ROWS);
  return { height, twoPane, contentWidth, leftWidth, rightWidth, listHeight, detailHeight };
}
