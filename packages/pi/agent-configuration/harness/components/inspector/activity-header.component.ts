import type { Theme } from "@earendil-works/pi-coding-agent";
import { viewHeader } from "../split-view/view-header.component.ts";

export function activityHeader(theme: Theme, width: number, totalCalls: number, active: boolean): string[] {
  const activityGlyph = active ? "●" : "○";
  const activityColor = active ? "accent" : "muted";
  const indicator = theme.fg(activityColor, activityGlyph);
  const callLabel = `${totalCalls} call${totalCalls === 1 ? "" : "s"}`;
  return viewHeader(`${indicator} ${theme.fg("muted", callLabel)}`, width, theme);
}
