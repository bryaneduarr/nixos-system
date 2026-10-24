import { BODY_TOP_ROW } from "../../constants/inspector/layout.constant.ts";
import { LIST_PAGE_TEXT } from "../../constants/inspector/list-page-text.constant.ts";
import { DETAIL_TITLE_ROWS } from "../../constants/split-view/layout.constant.ts";
import { wrappedDetail } from "../../services/inspector/detail/lines/wrapped-detail.service.ts";
import { findRowAt } from "../../services/inspector/navigation/find-row-at.service.ts";
import { computeListScroll } from "../../services/split-view/layout/compute-list-scroll.service.ts";
import type { ToolsPageOptions, ToolsPageResult } from "../../types/inspector/view/tools-page.interface.ts";
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
    lines.push(theme.fg("dim", pageText.empty));
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
  const detailLines = detail.slice(clampedDetailScroll, clampedDetailScroll + geometry.detailHeight);
  lines.push(...splitPanes({ list: listLines, detail: detailLines, geometry, focus, theme }));

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
