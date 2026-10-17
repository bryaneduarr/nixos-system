import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { BODY_TOP_ROW, DETAIL_TITLE_ROWS } from "../../constants/inspector/layout.constant.ts";
import { BORDER_COLOR } from "../../constants/inspector/theme-color.constant.ts";
import { wrappedDetail } from "../../services/inspector/detail/wrapped-detail.service.ts";
import { computeListScroll } from "../../services/inspector/layout/compute-list-scroll.service.ts";
import { padCell } from "../../services/inspector/layout/pad-cell.service.ts";
import { findRowAt } from "../../services/inspector/navigation/find-row-at.service.ts";
import type { InspectorFocus } from "../../types/inspector/navigation/inspector-page.interface.ts";
import type { InspectorGeometry } from "../../types/inspector/view/inspector-geometry.interface.ts";
import type { ToolsPageOptions, ToolsPageResult } from "../../types/inspector/view/tools-page.interface.ts";
import { renderToolList } from "./tool-list.component.ts";

function twoPaneRows(
  listLines: readonly string[],
  detailLines: readonly string[],
  geometry: InspectorGeometry,
  focus: InspectorFocus,
  theme: Theme,
): string[] {
  const dividerColor = focus === "detail" ? "accent" : BORDER_COLOR;
  const rows: string[] = [];
  for (let index = 0; index < geometry.height; index += 1) {
    const left = listLines[index] ?? padCell("", geometry.leftWidth);
    const divider = theme.fg(dividerColor, "│");
    const right = detailLines[index] ?? "";
    rows.push(`${padCell(left, geometry.leftWidth)} ${divider} ${right}`);
  }
  return rows;
}

export function renderToolsPage({
  page,
  focus,
  rows,
  selected,
  expandedTasks,
  artifact,
  listScroll,
  detailScroll,
  geometry,
  theme,
}: ToolsPageOptions): ToolsPageResult {
  const pageTitle = page === "tools" ? "◆ Tool calls" : "◆ User messages";
  const lines = [theme.bold(theme.fg("accent", pageTitle))];

  if (rows.length === 0) {
    const emptyText = page === "tools" ? "  No tool calls yet." : "  No user messages yet.";
    lines.push(theme.fg("dim", emptyText));
    return { lines, layout: { kind: "none" }, listScroll, detailScroll };
  }

  const clampedListScroll = computeListScroll(listScroll, rows.length, geometry.listHeight, selected);
  const listLines = renderToolList({
    rows,
    width: geometry.leftWidth,
    height: geometry.listHeight,
    scroll: clampedListScroll,
    selected,
    expandedTasks,
    theme,
  });
  const detail = wrappedDetail(findRowAt(rows, selected), Math.max(1, geometry.rightWidth), theme, artifact);
  const maxDetailScroll = Math.max(0, detail.length - geometry.detailHeight);
  const clampedDetailScroll = Math.max(0, Math.min(detailScroll, maxDetailScroll));
  const detailLines = detail
    .slice(clampedDetailScroll, clampedDetailScroll + geometry.detailHeight)
    .map((line) => truncateToWidth(line, geometry.rightWidth, "", true));

  if (geometry.twoPane) {
    lines.push(...twoPaneRows(listLines, detailLines, geometry, focus, theme));
  } else {
    const detailTitle = theme.bold(theme.fg(focus === "detail" ? "accent" : "muted", "DETAIL"));
    lines.push(...listLines, detailTitle, ...detailLines);
  }

  return {
    lines,
    layout: {
      kind: "laid-out",
      layout: {
        leftWidth: geometry.leftWidth,
        bodyTop: BODY_TOP_ROW,
        bodyHeight: geometry.twoPane
          ? geometry.height
          : geometry.listHeight + DETAIL_TITLE_ROWS + geometry.detailHeight,
        listHeight: geometry.listHeight,
        twoPane: geometry.twoPane,
        rows,
      },
    },
    listScroll: clampedListScroll,
    detailScroll: clampedDetailScroll,
  };
}
