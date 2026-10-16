import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { InspectorPage } from "../../types/inspector/navigation/inspector-page.interface.ts";

export function padCell(text: string, width: number): string {
  const missing = width - visibleWidth(text);
  return missing > 0 ? `${text}${" ".repeat(missing)}` : text;
}

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

export function footer(page: InspectorPage, status: string, width: number, theme: Theme): string {
  const label = (key: string, name: string, target: InspectorPage): string =>
    page === target ? theme.bold(theme.fg("accent", `◆ ${key} ${name}`)) : theme.fg("muted", `◇ ${key} ${name}`);
  const links = [
    label("1", "Tools", "tools"),
    label("2", "Subagents", "subagents"),
    label("3", "Messages", "messages"),
  ].join("  ");
  const message = status ? theme.fg("accent", `  ${status}`) : "";
  return truncateToWidth(`${links}${message}`, width, "", true);
}
