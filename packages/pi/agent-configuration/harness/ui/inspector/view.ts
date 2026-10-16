import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { activityStore } from "../../activity/store.ts";
import {
  LEFT_PANE_WIDTH_RATIO,
  MAX_LEFT_WIDTH,
  MIN_LEFT_WIDTH,
  MIN_TWO_PANE_WIDTH,
  PANE_DIVIDER_WIDTH,
} from "../../constants/inspector/layout.constant.ts";
import {
  THINKING_TOOL_NAME,
  UPDATE_TOOL_NAME,
  USER_MESSAGE_TOOL_NAME,
} from "../../constants/inspector/pseudo-tool.constant.ts";
import type { DetailArtifact } from "../../types/inspector/detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorLayoutState } from "../../types/inspector/view/inspector-layout.interface.ts";
import type { InspectorViewResult, InspectorViewState } from "../../types/inspector/view/inspector-view.interface.ts";
import { buildDetail } from "./detail.ts";
import { footer, frameModal, padCell } from "./frame.ts";
import { renderSubagentList, renderToolList } from "./lists.ts";

export function bodyHeight(terminalRows: number): number {
  const scaledHeight = Math.floor(terminalRows * 0.8) - 6;
  return Math.max(6, Math.min(48, scaledHeight));
}

export function detailWidth(width: number): number {
  const contentWidth = Math.max(8, width - 4);
  if (width < MIN_TWO_PANE_WIDTH) return contentWidth;

  const leftWidth = Math.max(
    MIN_LEFT_WIDTH,
    Math.min(MAX_LEFT_WIDTH, Math.round(contentWidth * LEFT_PANE_WIDTH_RATIO)),
  );
  return Math.max(1, contentWidth - leftWidth - PANE_DIVIDER_WIDTH);
}

export function wrappedDetail(
  row: InspectorRow | undefined,
  width: number,
  theme: Theme,
  artifact: DetailArtifact,
): string[] {
  if (!row) return [];

  const lines: string[] = [];
  const details = buildDetail({ row, width, artifact });

  for (const detail of details) {
    if (detail.text === "") {
      lines.push("");
      continue;
    }

    const coloredText = detail.color === "plain" ? detail.text : theme.fg(detail.color, detail.text);
    const styledText = detail.bold ? theme.bold(coloredText) : coloredText;

    const wrappedLines = wrapTextWithAnsi(styledText, width);
    lines.push(...(wrappedLines.length > 0 ? wrappedLines : [""]));
  }

  return lines;
}

export function computeListScroll(previous: number, length: number, height: number, selected: number): number {
  const maxScroll = Math.max(0, length - height);
  let scroll = Math.min(previous, maxScroll);

  if (selected < scroll) {
    scroll = selected;
  } else if (selected >= scroll + height) {
    scroll = selected - height + 1;
  }

  return Math.max(0, Math.min(maxScroll, scroll));
}

function activityHeader(theme: Theme, width: number, totalCalls: number, active: boolean): string[] {
  const activityGlyph = active ? "●" : "○";
  const activityColor = active ? "accent" : "muted";
  const indicator = theme.fg(activityColor, activityGlyph);
  const callLabel = `${totalCalls} call${totalCalls === 1 ? "" : "s"}`;
  const header = `${indicator} ${theme.fg("muted", callLabel)}`;
  const border = theme.fg("borderMuted", "─".repeat(width));

  return [truncateToWidth(header, width, "", true), border];
}

function idlePrompt(width: number, theme: Theme): string[] {
  const prompt = "Initialize with a task to visualize tools.";
  const padding = Math.max(0, Math.floor((width - visibleWidth(prompt)) / 2));
  const centeredPrompt = `${" ".repeat(padding)}${prompt}`;

  return ["", theme.fg("muted", centeredPrompt), ""];
}

export function renderInspector(state: InspectorViewState): InspectorViewResult {
  const { width, theme, page, focus, rows } = state;
  const height = bodyHeight(state.terminalRows);
  const twoPane = width >= MIN_TWO_PANE_WIDTH;
  const contentWidth = Math.max(8, width - 4);
  const leftWidth = twoPane
    ? Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, Math.round(contentWidth * LEFT_PANE_WIDTH_RATIO)))
    : contentWidth;
  const rightWidth = twoPane ? Math.max(1, contentWidth - leftWidth - PANE_DIVIDER_WIDTH) : contentWidth;
  const listHeight = twoPane ? height : Math.max(4, Math.floor((height - 1) * 0.38));
  const detailHeight = twoPane ? height : Math.max(3, height - listHeight - 1);
  let { detailScroll, subagentScroll, subagentSelection } = state;
  let listScroll = state.listScroll;
  let layout: InspectorLayoutState = { kind: "none" };

  const activityEntries = activityStore.all();
  const totalCalls = activityEntries.filter(
    (entry) =>
      entry.toolName !== THINKING_TOOL_NAME &&
      entry.toolName !== USER_MESSAGE_TOOL_NAME &&
      entry.toolName !== UPDATE_TOOL_NAME,
  ).length;
  const phase = activityStore.currentAgent().phase;
  const active = phase === "thinking" || phase === "working" || phase === "responding";
  const lines = activityHeader(theme, contentWidth, totalCalls, active);

  if (activityEntries.length === 0 && phase === "idle") {
    lines.push(...idlePrompt(contentWidth, theme));
  } else if (page === "subagents") {
    const title = theme.bold(theme.fg("accent", "◆ Subagents"));
    lines.push(title);

    const subagents = state.subagents;
    if (subagents.length === 0) {
      lines.push(theme.fg("dim", "  No subagents have been spawned yet."));
    } else {
      const isSelectionAvailable = subagents.some(
        (row) => subagentSelection.kind === "selected" && row.id === subagentSelection.id,
      );
      if (!isSelectionAvailable) {
        const lastSubagent = subagents[subagents.length - 1];
        subagentSelection = lastSubagent ? { kind: "selected", id: lastSubagent.id } : { kind: "none" };
      }

      const selectedIndex = subagents.findIndex(
        (row) => subagentSelection.kind === "selected" && row.id === subagentSelection.id,
      );
      const availableRows = Math.max(1, height - 1);
      const maxScroll = Math.max(0, subagents.length - availableRows);
      const preferredScroll = Math.min(subagentScroll, Math.max(0, selectedIndex));
      subagentScroll = Math.max(0, Math.min(maxScroll, preferredScroll));
      if (selectedIndex >= subagentScroll + availableRows) {
        subagentScroll = selectedIndex - availableRows + 1;
      }

      const subagentLines = renderSubagentList({
        rows: subagents,
        width: contentWidth,
        height: availableRows,
        scroll: subagentScroll,
        selection: subagentSelection,
        theme,
      });
      lines.push(...subagentLines);
    }
  } else {
    const pageTitle = page === "tools" ? "◆ Tool calls" : "◆ User messages";
    lines.push(theme.bold(theme.fg("accent", pageTitle)));

    if (rows.length === 0) {
      const emptyText = page === "tools" ? "  No tool calls yet." : "  No user messages yet.";
      lines.push(theme.fg("dim", emptyText));
    } else {
      listScroll = computeListScroll(listScroll, rows.length, listHeight, state.selected);

      const listLines = renderToolList({
        rows,
        width: leftWidth,
        height: listHeight,
        scroll: listScroll,
        selected: state.selected,
        expandedTasks: state.expandedTasks,
        theme,
      });
      const selectedRow = rows[state.selected];
      const detail = wrappedDetail(selectedRow, Math.max(1, rightWidth), theme, state.artifact);
      const maxDetailScroll = Math.max(0, detail.length - detailHeight);
      detailScroll = Math.max(0, Math.min(detailScroll, maxDetailScroll));

      const visibleDetail = detail.slice(detailScroll, detailScroll + detailHeight);
      const detailLines = visibleDetail.map((line) => truncateToWidth(line, rightWidth, "", true));

      if (twoPane) {
        for (let index = 0; index < height; index += 1) {
          const left = listLines[index] ?? padCell("", leftWidth);
          const dividerColor = focus === "detail" ? "accent" : "borderMuted";
          const divider = theme.fg(dividerColor, "│");
          const right = detailLines[index] ?? "";
          lines.push(`${padCell(left, leftWidth)} ${divider} ${right}`);
        }
      } else {
        lines.push(...listLines);
        const detailTitle = theme.bold(theme.fg(focus === "detail" ? "accent" : "muted", "DETAIL"));
        lines.push(detailTitle);
        lines.push(...detailLines);
      }

      layout = {
        kind: "laid-out",
        layout: {
          leftWidth,
          bodyTop: 4,
          bodyHeight: twoPane ? height : listHeight + 1 + detailHeight,
          listHeight,
          twoPane,
          rows,
        },
      };
    }
  }

  const footerY = lines.length + 1;
  lines.push(footer(page, state.status, contentWidth, theme));

  return {
    lines: frameModal(lines, width, theme),
    layout,
    footerY,
    detailViewportHeight: detailHeight,
    subagentSelection,
    subagentScroll,
    listScroll,
    detailScroll,
  };
}
