import { truncateToWidth } from "@earendil-works/pi-tui";
import type { SplitViewFooterLink } from "../../types/split-view/footer-link.interface.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";

export function footerLinks(
  links: readonly SplitViewFooterLink[],
  status: string,
  width: number,
  theme: SplitViewTheme,
): string {
  const linkText = links
    .map((link) => {
      const label = `${link.key} ${link.name}`;
      return link.active ? theme.bold(theme.fg("accent", `◆ ${label}`)) : theme.fg("muted", `◇ ${label}`);
    })
    .join("  ");
  const message = status ? theme.fg("accent", `  ${status}`) : "";
  return truncateToWidth(`${linkText}${message}`, width, "", true);
}
