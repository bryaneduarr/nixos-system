import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

export function activityHeader(theme: Theme, width: number, totalCalls: number, active: boolean): string[] {
  const activityGlyph = active ? "●" : "○";
  const activityColor = active ? "accent" : "muted";
  const indicator = theme.fg(activityColor, activityGlyph);
  const callLabel = `${totalCalls} call${totalCalls === 1 ? "" : "s"}`;
  const header = `${indicator} ${theme.fg("muted", callLabel)}`;
  const border = theme.fg("borderMuted", "─".repeat(width));

  return [truncateToWidth(header, width, "", true), border];
}
