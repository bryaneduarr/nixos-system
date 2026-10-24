import type { InspectorFooterLink } from "../../../types/inspector/view/inspector-footer-link.interface.ts";

/** Page links shown in the inspector footer, in display order. */
export const FOOTER_LINKS: readonly InspectorFooterLink[] = [
  { page: "tools", key: "1", name: "Tools" },
  { page: "subagents", key: "2", name: "Subagents" },
  { page: "history", key: "3", name: "History" },
];
