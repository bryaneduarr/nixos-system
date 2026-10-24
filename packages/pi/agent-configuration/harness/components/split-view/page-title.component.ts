import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";

export function pageTitle(title: string, theme: SplitViewTheme): string {
  return theme.bold(theme.fg("accent", `◆ ${title}`));
}
