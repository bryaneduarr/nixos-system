import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { padCell } from "../../services/inspector/layout/pad-cell.service.ts";

export function frameModal(lines: string[], width: number, theme: Theme): string[] {
  const innerWidth = Math.max(4, width - 4);
  const top = theme.fg("borderMuted", `╭${"─".repeat(Math.max(0, width - 2))}╮`);
  const content = lines.map((line) => {
    const padded = padCell(truncateToWidth(line, innerWidth, "", true), innerWidth);
    return `${theme.fg("borderMuted", "│")} ${padded} ${theme.fg("borderMuted", "│")}`;
  });
  const bottom = theme.fg("borderMuted", `╰${"─".repeat(Math.max(0, width - 2))}╯`);
  return [top, ...content, bottom];
}
