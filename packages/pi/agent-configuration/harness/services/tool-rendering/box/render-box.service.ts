import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import {
  BOX_CORNER,
  BOX_HORIZONTAL_RULE,
  BOX_TITLE_PREFIX,
  BOX_VERTICAL_RULE,
} from "../../../constants/tool-rendering/box/box-frame.constant.ts";
import {
  BOX_CORNER_WIDTH,
  BOX_SIDE_CHROME_WIDTH,
  MIN_RENDERABLE_BOX_WIDTH,
} from "../../../constants/tool-rendering/box/box-width.constant.ts";

export function renderBox(title: string, lines: readonly string[], width: number): string[] {
  if (width < MIN_RENDERABLE_BOX_WIDTH) {
    return [`${BOX_TITLE_PREFIX}${title}`];
  }

  const prefix = `${BOX_TITLE_PREFIX}${title} `;
  const titleDashes = Math.max(0, width - visibleWidth(prefix) - BOX_CORNER_WIDTH);
  const bottomDashes = Math.max(0, width - 2 * BOX_CORNER_WIDTH);
  const inner = Math.max(0, width - BOX_SIDE_CHROME_WIDTH);

  const rendered = [`${prefix}${BOX_HORIZONTAL_RULE.repeat(titleDashes)}${BOX_CORNER}`];
  for (const line of lines) {
    rendered.push(`${BOX_VERTICAL_RULE} ${truncateToWidth(line, inner, "", true)} ${BOX_VERTICAL_RULE}`);
  }
  rendered.push(`${BOX_CORNER}${BOX_HORIZONTAL_RULE.repeat(bottomDashes)}${BOX_CORNER}`);
  return rendered;
}
