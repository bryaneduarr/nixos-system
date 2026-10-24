import { SUBAGENT_PAGE_HEADER_ROWS } from "../../constants/inspector/layout/page-layout.constant.ts";
import { SUBAGENTS_PAGE_TEXT } from "../../constants/inspector/lists/list-page-text.constant.ts";
import { THEME_DIM } from "../../constants/split-view/theme-color.constant.ts";
import { clampSubagentSelection } from "../../services/inspector/subagents/clamp-subagent-selection.service.ts";
import { isSubagentSelected } from "../../services/inspector/subagents/is-subagent-selected.service.ts";
import { computeListScroll } from "../../services/split-view/layout/compute-list-scroll.service.ts";
import type { SubagentsPageOptions } from "../../types/inspector/view/subagents-page-options.interface.ts";
import type { SubagentsPageResult } from "../../types/inspector/view/subagents-page-result.interface.ts";
import { pageTitle } from "../split-view/page-title.component.ts";
import { renderSubagentList } from "./lists/subagent-list.component.ts";

export function renderSubagentsPage({
  subagents,
  selection,
  scroll,
  width,
  height,
  theme,
}: SubagentsPageOptions): SubagentsPageResult {
  const lines = [pageTitle(SUBAGENTS_PAGE_TEXT.title, theme)];
  if (subagents.length === 0) {
    lines.push(theme.fg(THEME_DIM, SUBAGENTS_PAGE_TEXT.empty));
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
