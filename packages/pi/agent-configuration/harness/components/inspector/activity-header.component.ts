import { THEME_ACCENT, THEME_MUTED } from "../../constants/split-view/theme-color.constant.ts";
import type { ActivityHeaderOptions } from "../../types/inspector/view/activity-header-options.interface.ts";
import { viewHeader } from "../split-view/view-header.component.ts";

export function activityHeader({ theme, width, totalCalls, active }: ActivityHeaderOptions): string[] {
  const activityGlyph = active ? "●" : "○";
  const activityColor = active ? THEME_ACCENT : THEME_MUTED;
  const indicator = theme.fg(activityColor, activityGlyph);
  const callLabel = `${totalCalls} call${totalCalls === 1 ? "" : "s"}`;
  return viewHeader(`${indicator} ${theme.fg(THEME_MUTED, callLabel)}`, width, theme);
}
