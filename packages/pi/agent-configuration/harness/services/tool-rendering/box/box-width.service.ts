import { visibleWidth } from "@earendil-works/pi-tui";
import { BOX_TITLE_PREFIX } from "../../../constants/tool-rendering/box/box-frame.constant.ts";
import {
  BOX_CORNER_WIDTH,
  BOX_SIDE_CHROME_WIDTH,
  MAX_BOX_WIDTH,
  MIN_BOX_WIDTH,
  MIN_RENDERABLE_BOX_WIDTH,
} from "../../../constants/tool-rendering/box/box-width.constant.ts";

export function boxWidth(available: number, title: string, lines: readonly string[]): number {
  const titleWidth = visibleWidth(`${BOX_TITLE_PREFIX}${title} `) + BOX_CORNER_WIDTH;
  const bodyWidth = lines.reduce((max, line) => Math.max(max, visibleWidth(line)), 0) + BOX_SIDE_CHROME_WIDTH;
  const desired = Math.max(MIN_BOX_WIDTH, titleWidth, bodyWidth);
  const maxAllowed = Math.max(MIN_RENDERABLE_BOX_WIDTH, Math.min(available, MAX_BOX_WIDTH));
  return Math.min(desired, maxAllowed);
}
