import type { SplitViewFooterLink } from "./footer-link.interface.ts";
import type { SplitViewTheme } from "./split-view-theme.interface.ts";

/** Page links and status message to draw as one footer line. */
export interface FooterLinksInput {
  /** Page links in display order. */
  readonly links: readonly SplitViewFooterLink[];
  /** Status message shown after the links, or an empty string. */
  readonly status: string;
  /** Width of the footer line in columns. */
  readonly width: number;
  /** Theme used to color the links. */
  readonly theme: SplitViewTheme;
}
