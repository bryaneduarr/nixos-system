import { LIST_PAGE_TEXT } from "../../constants/inspector/lists/list-page-text.constant.ts";
import { THEME_DIM } from "../../constants/split-view/theme-color.constant.ts";
import { wrappedDetail } from "../../services/inspector/detail/lines/wrapped-detail.service.ts";
import { buildToolsPageLayout } from "../../services/inspector/layout/build-tools-page-layout.service.ts";
import { clampDetailScroll } from "../../services/inspector/layout/clamp-detail-scroll.service.ts";
import { findRowAt } from "../../services/inspector/navigation/find-row-at.service.ts";
import { computeListScroll } from "../../services/split-view/layout/compute-list-scroll.service.ts";
import type { ToolsPageOptions } from "../../types/inspector/view/tools-page-options.interface.ts";
import type { ToolsPageResult } from "../../types/inspector/view/tools-page-result.interface.ts";
import { pageTitle } from "../split-view/page-title.component.ts";
import { splitPanes } from "../split-view/split-panes.component.ts";
import { renderToolList } from "./lists/tool-list.component.ts";

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
  const pageText = LIST_PAGE_TEXT[page];
  const lines = [pageTitle(pageText.title, theme)];

  if (rows.length === 0) {
    lines.push(theme.fg(THEME_DIM, pageText.empty));
    return { lines, layout: { kind: "none" }, listScroll, detailScroll };
  }

  const clampedListScroll = computeListScroll({
    previous: listScroll,
    length: rows.length,
    height: geometry.listHeight,
    selected,
  });
  const listLines = renderToolList({
    rows,
    width: geometry.leftWidth,
    height: geometry.listHeight,
    scroll: clampedListScroll,
    selected,
    expandedTasks,
    theme,
  });
  const detail = wrappedDetail({
    lookup: findRowAt(rows, selected),
    width: Math.max(1, geometry.rightWidth),
    theme,
    artifact,
  });
  const clampedDetailScroll = clampDetailScroll(detailScroll, detail.length, geometry.detailHeight);
  const detailLines = detail.slice(clampedDetailScroll, clampedDetailScroll + geometry.detailHeight);
  lines.push(...splitPanes({ list: listLines, detail: detailLines, geometry, focus, theme }));

  return {
    lines,
    layout: buildToolsPageLayout(geometry, rows),
    listScroll: clampedListScroll,
    detailScroll: clampedDetailScroll,
  };
}
