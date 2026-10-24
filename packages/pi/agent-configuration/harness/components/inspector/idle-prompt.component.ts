import type { Theme } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { THEME_MUTED } from "../../constants/split-view/theme-color.constant.ts";

const IDLE_PROMPT = "Initialize with a task to visualize tools.";

export function idlePrompt(width: number, theme: Theme): string[] {
  const padding = Math.max(0, Math.floor((width - visibleWidth(IDLE_PROMPT)) / 2));
  const centeredPrompt = `${" ".repeat(padding)}${IDLE_PROMPT}`;

  return ["", theme.fg(THEME_MUTED, centeredPrompt), ""];
}
