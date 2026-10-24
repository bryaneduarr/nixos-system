import { truncateToWidth } from "@earendil-works/pi-tui";
import { HORIZONTAL_RULE } from "../../constants/split-view/text.constant.ts";
import { BORDER_COLOR } from "../../constants/split-view/theme-color.constant.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";

export function viewHeader(text: string, width: number, theme: Pick<SplitViewTheme, "fg">): string[] {
  return [truncateToWidth(text, width, "", true), theme.fg(BORDER_COLOR, HORIZONTAL_RULE.repeat(width))];
}
