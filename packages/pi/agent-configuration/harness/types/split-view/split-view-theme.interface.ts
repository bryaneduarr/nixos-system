import type { ThemeBg, ThemeColor } from "@earendil-works/pi-coding-agent";

/** Theme operations the split view components use. */
export interface SplitViewTheme {
  /** Applies a foreground color to text. */
  fg(color: ThemeColor, text: string): string;
  /** Applies a background color to text. */
  bg(color: ThemeBg, text: string): string;
  /** Renders text in bold. */
  bold(text: string): string;
}
