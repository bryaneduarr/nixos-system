import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import {
  FRAME_CHROME_WIDTH,
  FRAME_CORNER_COLUMNS,
  MIN_FRAME_INNER_WIDTH,
} from "../../constants/inspector/frame.constant.ts";
import { BORDER_COLOR } from "../../constants/inspector/theme-color.constant.ts";
import { padCell } from "../../services/inspector/layout/pad-cell.service.ts";

export function frameModal(lines: string[], width: number, theme: Theme): string[] {
  const innerWidth = Math.max(MIN_FRAME_INNER_WIDTH, width - FRAME_CHROME_WIDTH);
  const horizontalRule = "─".repeat(Math.max(0, width - FRAME_CORNER_COLUMNS));
  const sideBorder = theme.fg(BORDER_COLOR, "│");
  const top = theme.fg(BORDER_COLOR, `╭${horizontalRule}╮`);
  const content = lines.map((line) => {
    const padded = padCell(truncateToWidth(line, innerWidth, "", true), innerWidth);
    return `${sideBorder} ${padded} ${sideBorder}`;
  });
  const bottom = theme.fg(BORDER_COLOR, `╰${horizontalRule}╯`);
  return [top, ...content, bottom];
}
