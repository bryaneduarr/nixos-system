import type { ListInspectorPage } from "../../../types/inspector/navigation/inspector-page.interface.ts";

/** Title and empty-list text of each inspector page that lists rows. */
export const LIST_PAGE_TEXT: Readonly<Record<ListInspectorPage, { readonly title: string; readonly empty: string }>> = {
  tools: { title: "Tool calls", empty: "  No tool calls yet." },
  subagent: { title: "Subagent  ← back to subagents", empty: "  This subagent is no longer recorded." },
  history: { title: "History", empty: "  No thinking, replies, usage, or warnings yet." },
};

/** Title and empty-list text of the subagents page. */
export const SUBAGENTS_PAGE_TEXT = { title: "Subagents", empty: "  No subagents have been spawned yet." } as const;
