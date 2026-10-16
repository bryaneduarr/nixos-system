import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import type { InspectorPage } from "../../types/inspector/navigation/inspector-page.interface.ts";

export function inspectorFooter(page: InspectorPage, status: string, width: number, theme: Theme): string {
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
