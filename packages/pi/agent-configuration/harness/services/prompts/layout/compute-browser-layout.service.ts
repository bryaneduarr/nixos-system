import { FRAME_BORDER_COLUMNS, PANE_SEPARATOR_WIDTH } from "../../../constants/prompts/layout.constant.ts";
import {
  BROWSER_CHROME_ROWS,
  BROWSER_HEIGHT_RATIO,
  LIST_MIN_WIDTH,
  LIST_WIDTH_RATIO,
  STACKED_LAYOUT_BELOW_WIDTH,
  STACKED_LIST_MAX_ROWS,
} from "../../../constants/prompts/viewer.constant.ts";
import type { BrowserLayout } from "../../../types/prompts/browser-layout.interface.ts";

export function computeBrowserLayout(width: number, terminalRows: number): BrowserLayout {
  const height = Math.max(1, Math.min(terminalRows, Math.floor(terminalRows * BROWSER_HEIGHT_RATIO)));
  const inner = Math.max(0, width - FRAME_BORDER_COLUMNS);
  const body = Math.max(1, height - BROWSER_CHROME_ROWS);
  const stacked = width < STACKED_LAYOUT_BELOW_WIDTH;
  const listWidth = stacked ? inner : Math.max(LIST_MIN_WIDTH, Math.floor(inner * LIST_WIDTH_RATIO));
  const listHeight = stacked ? Math.min(STACKED_LIST_MAX_ROWS, Math.max(1, Math.floor(body / 3))) : body;
  const detailWidth = Math.max(1, stacked ? inner : inner - listWidth - PANE_SEPARATOR_WIDTH);
  const pageSize = Math.max(1, stacked ? body - listHeight - 1 : body);
  return { height, inner, body, stacked, listWidth, listHeight, detailWidth, pageSize };
}
