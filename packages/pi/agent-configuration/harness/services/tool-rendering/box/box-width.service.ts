import { visibleWidth } from "@earendil-works/pi-tui";
import { BOX_TITLE_PREFIX } from "../../../constants/tool-rendering/box-frame.constant.ts";
import {
  MAX_BOX_WIDTH,
  MIN_BOX_WIDTH,
  MIN_RENDERABLE_BOX_WIDTH,
} from "../../../constants/tool-rendering/box-width.constant.ts";

const BOX_BODY_PADDING = 4;
const BOX_TITLE_TRAILING_WIDTH = 1;

export function boxWidth(available: number, title: string, lines: readonly string[]): number {
  const titleWidth = visibleWidth(`${BOX_TITLE_PREFIX}${title} `) + BOX_TITLE_TRAILING_WIDTH;
  const bodyWidth = lines.reduce((max, line) => Math.max(max, visibleWidth(line)), 0) + BOX_BODY_PADDING;
  const desired = Math.max(MIN_BOX_WIDTH, titleWidth, bodyWidth);
  const maxAllowed = Math.max(MIN_RENDERABLE_BOX_WIDTH, Math.min(available, MAX_BOX_WIDTH));
  return Math.min(desired, maxAllowed);
}
