import type { Theme } from "@earendil-works/pi-coding-agent";
import { FOOTER_LINKS } from "../../constants/inspector/footer.constant.ts";
import type { InspectorPage } from "../../types/inspector/navigation/inspector-page.interface.ts";
import { footerLinks } from "../split-view/footer-links.component.ts";

export function inspectorFooter(page: InspectorPage, status: string, width: number, theme: Theme): string {
  const activePage = page === "subagent" ? "subagents" : page;
  const links = FOOTER_LINKS.map((link) => ({ key: link.key, name: link.name, active: link.page === activePage }));
  return footerLinks({ links, status, width, theme });
}
