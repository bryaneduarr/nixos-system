import { truncateToWidth } from "@earendil-works/pi-tui";
import { THEME_ACCENT, THEME_MUTED } from "../../constants/split-view/theme-color.constant.ts";
import { ACTIVE_MARKER, INACTIVE_MARKER } from "../../constants/text/glyph.constant.ts";
import { formatFooterLink } from "../../services/split-view/footer/format-footer-link.service.ts";
import type { FooterLinksInput } from "../../types/split-view/footer-links-input.interface.ts";

export function footerLinks({ links, status, width, theme }: FooterLinksInput): string {
  const linkText = links
    .map((link) =>
      link.active
        ? theme.bold(theme.fg(THEME_ACCENT, formatFooterLink(link, ACTIVE_MARKER)))
        : theme.fg(THEME_MUTED, formatFooterLink(link, INACTIVE_MARKER)),
    )
    .join("  ");
  const message = status ? theme.fg(THEME_ACCENT, `  ${status}`) : "";
  return truncateToWidth(`${linkText}${message}`, width, "", true);
}
