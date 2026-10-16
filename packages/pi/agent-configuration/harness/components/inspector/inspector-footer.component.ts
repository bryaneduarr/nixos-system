import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { FOOTER_LINKS } from "../../constants/inspector/footer.constant.ts";
import type { InspectorPage } from "../../types/inspector/navigation/inspector-page.interface.ts";

export function inspectorFooter(page: InspectorPage, status: string, width: number, theme: Theme): string {
  const links = FOOTER_LINKS.map((link) => {
    const label = `${link.key} ${link.name}`;
    return page === link.page ? theme.bold(theme.fg("accent", `◆ ${label}`)) : theme.fg("muted", `◇ ${label}`);
  }).join("  ");
  const message = status ? theme.fg("accent", `  ${status}`) : "";
  return truncateToWidth(`${links}${message}`, width, "", true);
}
