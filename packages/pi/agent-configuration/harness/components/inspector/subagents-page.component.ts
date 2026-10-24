import { SUBAGENT_PAGE_HEADER_ROWS } from "../../constants/inspector/layout.constant.ts";
import { THEME_DIM } from "../../constants/split-view/theme-color.constant.ts";
import { isSubagentSelected } from "../../services/inspector/subagents/is-subagent-selected.service.ts";
import { computeListScroll } from "../../services/split-view/layout/compute-list-scroll.service.ts";
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
    lines.push(theme.fg(THEME_DIM, "  No subagents have been spawned yet."));
    return { lines, selection, scroll };
  }

  const clampedSelection = clampSubagentSelection(subagents, selection);
  const selectedIndex = subagents.findIndex((row) => isSubagentSelected(row, clampedSelection));
  const availableRows = Math.max(1, height - SUBAGENT_PAGE_HEADER_ROWS);
  const clampedScroll = computeListScroll({
    previous: scroll,
    length: subagents.length,
    height: availableRows,
    selected: selectedIndex,
  });

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
