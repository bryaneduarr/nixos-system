import { THEME_ACCENT } from "../../constants/split-view/theme-color.constant.ts";
import { ACTIVE_MARKER } from "../../constants/text/glyph.constant.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";

export function pageTitle(title: string, theme: SplitViewTheme): string {
  return theme.bold(theme.fg(THEME_ACCENT, `${ACTIVE_MARKER}${title}`));
}
