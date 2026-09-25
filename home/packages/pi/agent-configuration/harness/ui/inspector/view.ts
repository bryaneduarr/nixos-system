import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { activityStore, type ToolActivity } from "../../activity/store.ts";
import { buildDetail, type InspectorRow } from "./detail.ts";
import { footer, frameModal, padCell } from "./frame.ts";
import type { InspectorLayout, InspectorPage } from "./input.ts";
import { renderSubagentList, renderToolList } from "./lists.ts";

export const MIN_TWO_PANE_WIDTH = 64;
export const MIN_LEFT_WIDTH = 24;
export const MAX_LEFT_WIDTH = 44;

export interface InspectorViewState {
  width: number;
  terminalRows: number;
  theme: Theme;
  page: InspectorPage;
  focus: "list" | "detail";
  status: string;
  rows: InspectorRow[];
  selected: number;
  expandedTasks: ReadonlySet<string>;
  artifactText?: string;
  subagents: ToolActivity[];
  subagentSelectedId?: string;
  subagentScroll: number;
  listScroll: number;
  detailScroll: number;
}

export interface InspectorViewResult {
  lines: string[];
  layout?: InspectorLayout;
  footerY: number;
  detailViewportHeight: number;
  subagentSelectedId?: string;
  subagentScroll: number;
  listScroll: number;
  detailScroll: number;
}

export function bodyHeight(terminalRows: number): number {
  return Math.max(6, Math.min(48, Math.floor(terminalRows * 0.8) - 6));
}

export function detailWidth(width: number): number {
  const content = Math.max(8, width - 4);
  if (width < MIN_TWO_PANE_WIDTH) return content;
  const left = Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, Math.round(content * 0.34)));
  return Math.max(1, content - left - 3);
}

export function wrappedDetail(
  row: InspectorRow | undefined,
  width: number,
  theme: Theme,
  artifactText: string | undefined,
  expandedTasks: ReadonlySet<string>,
): string[] {
  if (!row) return [];
  const lines: string[] = [];
  for (const line of buildDetail({
    row, width, artifactText, taskExpanded: expandedTasks.has(row.entry.id),
  })) {
    if (line.text === "") {
      lines.push("");
      continue;
    }
    let styled = line.color ? theme.fg(line.color, line.text) : line.text;
    if (line.bold) styled = theme.bold(styled);
    const pieces = wrapTextWithAnsi(styled, width);
    lines.push(...(pieces.length > 0 ? pieces : [""]));
  }
  return lines;
}

export function computeListScroll(
  previous: number, length: number, height: number, selected: number,
): number {
  const maxScroll = Math.max(0, length - height);
  let scroll = Math.min(previous, maxScroll);
  if (selected < scroll) scroll = selected;
  else if (selected >= scroll + height) scroll = selected - height + 1;
  return Math.max(0, Math.min(maxScroll, scroll));
}

export function renderInspector(state: InspectorViewState): InspectorViewResult {
  const { width, theme, page, focus, rows } = state;
  const height = bodyHeight(state.terminalRows);
  const twoPane = width >= MIN_TWO_PANE_WIDTH;
  const contentWidth = Math.max(8, width - 4);
  const leftWidth = twoPane
    ? Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, Math.round(contentWidth * 0.34)))
    : contentWidth;
  const rightWidth = twoPane ? Math.max(1, contentWidth - leftWidth - 3) : contentWidth;
  const listHeight = twoPane ? height : Math.max(4, Math.floor((height - 1) * 0.38));
  const detailHeight = twoPane ? height : Math.max(3, height - listHeight - 1);
  let { detailScroll, subagentScroll, subagentSelectedId } = state;
  let listScroll = state.listScroll;
  let layout: InspectorLayout | undefined;
  const totalCalls = activityStore.all().filter(
    (entry) => entry.toolName !== "thinking" && entry.toolName !== "message" && entry.toolName !== "update",
  ).length;
  const phase = activityStore.currentAgent().phase;
  const active = phase === "thinking" || phase === "working" || phase === "responding";
  const header = `${theme.fg(active ? "accent" : "muted", active ? "●" : "○")} ${theme.fg(
    "muted", `${totalCalls} call${totalCalls === 1 ? "" : "s"}`,
  )}`;
  const lines = [truncateToWidth(header, contentWidth, "", true), theme.fg("borderMuted", "─".repeat(contentWidth))];

  if (activityStore.all().length === 0 && phase === "idle") {
    const prompt = "Initialize with a task to visualize tools.";
    const padding = Math.max(0, Math.floor((contentWidth - visibleWidth(prompt)) / 2));
    lines.push("", theme.fg("muted", `${" ".repeat(padding)}${prompt}`), "");
  } else if (page === "subagents") {
    lines.push(theme.bold(theme.fg("accent", "◆ Subagents")));
    const subagents = state.subagents;
    if (subagents.length === 0) {
      lines.push(theme.fg("dim", "  No subagents have been spawned yet."));
    } else {
      if (!subagentSelectedId || !subagents.some((row) => row.id === subagentSelectedId)) {
        subagentSelectedId = subagents[subagents.length - 1]?.id;
      }
      const selected = subagents.findIndex((row) => row.id === subagentSelectedId);
      const available = Math.max(1, height - 1);
      const maxScroll = Math.max(0, subagents.length - available);
      subagentScroll = Math.max(0, Math.min(maxScroll, Math.min(subagentScroll, Math.max(0, selected))));
      if (selected >= subagentScroll + available) subagentScroll = selected - available + 1;
      lines.push(...renderSubagentList({
        rows: subagents, width: contentWidth, height: available,
        scroll: subagentScroll, selectedId: subagentSelectedId ?? "", theme,
      }));
    }
  } else {
    lines.push(theme.bold(theme.fg("accent", page === "tools" ? "◆ Tool calls" : "◆ User messages")));
    if (rows.length === 0) {
      lines.push(theme.fg("dim", page === "tools" ? "  No tool calls yet." : "  No user messages yet."));
    } else {
      listScroll = computeListScroll(listScroll, rows.length, listHeight, state.selected);
      const listLines = renderToolList({
        rows, width: leftWidth, height: listHeight, scroll: listScroll,
        selected: state.selected, expandedTasks: state.expandedTasks, theme,
      });
      const detail = wrappedDetail(
        rows[state.selected], Math.max(1, rightWidth), theme, state.artifactText, state.expandedTasks,
      );
      detailScroll = Math.max(0, Math.min(detailScroll, Math.max(0, detail.length - detailHeight)));
      const detailLines = detail.slice(detailScroll, detailScroll + detailHeight)
        .map((line) => truncateToWidth(line, rightWidth, "", true));
      if (twoPane) {
        for (let index = 0; index < height; index++) {
          const left = listLines[index] ?? padCell("", leftWidth);
          const divider = theme.fg(focus === "detail" ? "accent" : "borderMuted", "│");
          lines.push(`${padCell(left, leftWidth)} ${divider} ${detailLines[index] ?? ""}`);
        }
      } else {
        lines.push(...listLines);
        lines.push(theme.bold(theme.fg(focus === "detail" ? "accent" : "muted", "DETAIL")));
        lines.push(...detailLines);
      }
      layout = {
        leftWidth, bodyTop: 4, bodyHeight: twoPane ? height : listHeight + 1 + detailHeight,
        listHeight, twoPane, rows,
      };
    }
  }

  const footerY = lines.length + 1;
  lines.push(footer(page, state.status, contentWidth, theme));
  return {
    lines: frameModal(lines, width, theme), layout, footerY,
    detailViewportHeight: detailHeight, subagentSelectedId, subagentScroll,
    listScroll, detailScroll,
  };
}
