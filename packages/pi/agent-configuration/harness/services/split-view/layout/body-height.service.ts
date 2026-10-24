import {
  BODY_HEIGHT_CHROME_ROWS,
  BODY_HEIGHT_TERMINAL_RATIO,
  MAX_BODY_HEIGHT,
  MIN_BODY_HEIGHT,
} from "../../../constants/split-view/layout.constant.ts";

export function bodyHeight(terminalRows: number): number {
  const scaledHeight = Math.floor(terminalRows * BODY_HEIGHT_TERMINAL_RATIO) - BODY_HEIGHT_CHROME_ROWS;
  return Math.max(MIN_BODY_HEIGHT, Math.min(MAX_BODY_HEIGHT, scaledHeight));
}
