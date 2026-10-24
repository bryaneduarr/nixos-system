import { SUBAGENT_PAGE_HEADER_ROWS } from "../../constants/inspector/layout.constant.ts";
import { isSubagentSelected } from "../../services/inspector/subagents/is-subagent-selected.service.ts";
import type { ToolActivity } from "../../types/activity/store/tool-activity.interface.ts";
import type { SubagentSelection } from "../../types/inspector/subagents/subagent-selection.interface.ts";
import type { SubagentsPageOptions, SubagentsPageResult } from "../../types/inspector/view/subagents-page.interface.ts";
import { pageTitle } from "../split-view/page-title.component.ts";
import { renderSubagentList } from "./lists/subagent-list.component.ts";

function clampSubagentSelection(subagents: readonly ToolActivity[], selection: SubagentSelection): SubagentSelection {
  if (subagents.some((row) => isSubagentSelected(row, selection))) return selection;
  const lastSubagent = subagents.at(-1);
  return lastSubagent ? { kind: "selected", id: lastSubagent.id } : { kind: "none" };
}

export function renderSubagentsPage({
  subagents,
  selection,
  scroll,
  width,
  height,
  theme,
}: SubagentsPageOptions): SubagentsPageResult {
  const lines = [pageTitle("Subagents", theme)];
  if (subagents.length === 0) {
    lines.push(theme.fg("dim", "  No subagents have been spawned yet."));
    return { lines, selection, scroll };
  }

  const clampedSelection = clampSubagentSelection(subagents, selection);
  const selectedIndex = subagents.findIndex((row) => isSubagentSelected(row, clampedSelection));
  const availableRows = Math.max(1, height - SUBAGENT_PAGE_HEADER_ROWS);
  const maxScroll = Math.max(0, subagents.length - availableRows);
  const preferredScroll = Math.min(scroll, Math.max(0, selectedIndex));
  let clampedScroll = Math.max(0, Math.min(maxScroll, preferredScroll));
  if (selectedIndex >= clampedScroll + availableRows) {
    clampedScroll = selectedIndex - availableRows + 1;
  }

  lines.push(
    ...renderSubagentList({
      rows: subagents,
      width,
      height: availableRows,
      scroll: clampedScroll,
      selection: clampedSelection,
      theme,
    }),
  );
  return { lines, selection: clampedSelection, scroll: clampedScroll };
}
