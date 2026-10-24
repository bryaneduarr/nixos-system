import { truncateToWidth } from "@earendil-works/pi-tui";
import {
  FRAME_CHROME_WIDTH,
  FRAME_CORNER_COLUMNS,
  MIN_FRAME_INNER_WIDTH,
} from "../../constants/split-view/frame.constant.ts";
import { BORDER_COLOR } from "../../constants/split-view/theme-color.constant.ts";
import { padCell } from "../../services/split-view/layout/pad-cell.service.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";

export function frameModal(lines: readonly string[], width: number, theme: Pick<SplitViewTheme, "fg">): string[] {
  const innerWidth = Math.max(MIN_FRAME_INNER_WIDTH, width - FRAME_CHROME_WIDTH);
  const horizontalRule = "─".repeat(Math.max(0, width - FRAME_CORNER_COLUMNS));
  const sideBorder = theme.fg(BORDER_COLOR, "│");
  const top = theme.fg(BORDER_COLOR, `╭${horizontalRule}╮`);
  const content = lines.map((line) => {
    const padded = padCell(truncateToWidth(line, innerWidth, "", true), innerWidth);
    return `${sideBorder} ${padded} ${sideBorder}`;
  });
  const bottom = theme.fg(BORDER_COLOR, `╰${horizontalRule}╯`);
  return [top, ...content, bottom].map((line) => truncateToWidth(line, width, "", false));
}
