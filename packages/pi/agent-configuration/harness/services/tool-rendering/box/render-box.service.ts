import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { BOX_TITLE_PREFIX } from "../../../constants/tool-rendering/box-frame.constant.ts";
import { MIN_RENDERABLE_BOX_WIDTH } from "../../../constants/tool-rendering/box-width.constant.ts";

export function renderBox(title: string, lines: readonly string[], width: number): string[] {
  if (width < MIN_RENDERABLE_BOX_WIDTH) {
    return [`${BOX_TITLE_PREFIX}${title}`];
  }

  const prefix = `${BOX_TITLE_PREFIX}${title} `;
  const dashes = Math.max(0, width - visibleWidth(prefix) - 1);
  const bottom = `+${"-".repeat(Math.max(0, width - 2))}+`;
  const inner = Math.max(0, width - 4);

  const rendered = [`${prefix}${"-".repeat(dashes)}+`];
  for (const line of lines) {
    rendered.push(`| ${truncateToWidth(line, inner, "", true)} |`);
  }
  rendered.push(bottom);
  return rendered;
}
