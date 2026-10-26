import type { SplitViewFooterLink } from "../../../types/split-view/footer-link.interface.ts";

export function formatFooterLink(link: Pick<SplitViewFooterLink, "key" | "name">, marker: string): string {
  return `${marker}${link.key} ${link.name}`;
}
