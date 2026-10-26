import { FOOTER_LINKS } from "../../constants/inspector/lists/footer.constant.ts";
import type { InspectorFooterOptions } from "../../types/inspector/view/inspector-footer-options.interface.ts";
import { footerLinks } from "../split-view/footer-links.component.ts";

export function inspectorFooter({ page, status, width, theme }: InspectorFooterOptions): string {
  const activePage = page === "subagent" ? "subagents" : page;
  const links = FOOTER_LINKS.map((link) => ({ key: link.key, name: link.name, active: link.page === activePage }));
  return footerLinks({ links, status, width, theme });
}
