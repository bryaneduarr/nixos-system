import type { Theme } from "@earendil-works/pi-coding-agent";
import { MESSAGE_ACTIVITY_NAME } from "../../constants/activity/activity-entry.constant.ts";
import { NO_TEXT_LABEL } from "../../constants/inspector/label.constant.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { formatDuration } from "../../services/inspector/detail/format-duration.service.ts";
import { formatTime } from "../../services/inspector/detail/format-time.service.ts";
import { readEndedAt } from "../../services/inspector/detail/read-ended-at.service.ts";
import { statusGlyph } from "../../services/inspector/labels/status-glyph.service.ts";
import { toolTargetLabel } from "../../services/inspector/labels/tool-target-label.service.ts";
import { usageLabel } from "../../services/inspector/labels/usage-label.service.ts";
import { padCell } from "../../services/split-view/layout/pad-cell.service.ts";
import { toolLabel } from "../../services/tool-rendering/presentation/tool-label.service.ts";
import type { InspectorRow } from "../../types/inspector/detail/inspector-row.interface.ts";
import type { ToolListOptions } from "../../types/inspector/lists/tool-list-options.interface.ts";
import { listRow } from "../split-view/list-row.component.ts";

function isLastChildRow(row: InspectorRow, rows: readonly InspectorRow[], index: number): boolean {
  const nextRow = rows[index + 1];
  if (nextRow === undefined) return true;

  return nextRow.level !== "sub" || nextRow.entry.id !== row.entry.id;
}

function rowDisclosure(row: InspectorRow, expandedTasks: ReadonlySet<string>, isLastChild: boolean): string {
  if (row.level === "sub") return isLastChild ? "  └─ " : "  ├─ ";
  if (row.entry.sub.length === 0) return "  ";
  return expandedTasks.has(row.entry.id) ? "▾ " : "▸ ";
}

function rowElapsed(row: InspectorRow): string {
  const startedAt = row.level === "sub" ? row.sub.startedAt : row.entry.startedAt;
  const endedAt = readEndedAt(row);
  const endTime = endedAt.state === "present" ? endedAt.value : Date.now();
  return formatDuration(Math.max(0, endTime - startedAt));
}

function rowUsage(row: InspectorRow, tool: string): string {
  if (row.level === "sub" || tool !== TASK_TOOL_NAME) return "";
  return `  ${usageLabel(row.entry.usage, row.entry.model)}`;
}

function rowStartTime(row: InspectorRow, call: { readonly toolName: string; readonly startedAt: number }): string {
  const isSubagentCall = row.level === "sub" || call.toolName === TASK_TOOL_NAME;
  return isSubagentCall ? `  ${formatTime(call.startedAt)}` : "";
}

function toolRowText(
  row: InspectorRow,
  expandedTasks: ReadonlySet<string>,
  isSelected: boolean,
  isLastChild: boolean,
  theme: Pick<Theme, "fg">,
): string {
  const call = row.level === "sub" ? row.sub : row.entry;
  const target = toolTargetLabel(call.toolName, call.args, row.entry.text);

  if (call.toolName === MESSAGE_ACTIVITY_NAME) {
    return theme.fg("accent", `◆ MESSAGE ${String(call.args.number ?? "")}  ${target || NO_TEXT_LABEL}`);
  }

  const prefix = call.toolName === TASK_TOOL_NAME ? "SUBAGENT " : "";
  const startTime = rowStartTime(row, call);
  const label = `${prefix}${toolLabel(call.toolName)}${startTime}  ${rowElapsed(row)}${rowUsage(row, call.toolName)}  ${target}`;
  const disclosure = rowDisclosure(row, expandedTasks, isLastChild);
  return `${statusGlyph(call.status, theme)} ${disclosure}${theme.fg(isSelected ? "accent" : "text", label)}`;
}

export function renderToolList({
  rows,
  width,
  height,
  scroll,
  selected,
  expandedTasks,
  theme,
}: ToolListOptions): string[] {
  const out: string[] = [];
  for (let index = 0; index < height; index += 1) {
    const row = rows[scroll + index];
    if (!row) {
      out.push(padCell("", width));
      continue;
    }
    const isSelected = scroll + index === selected;
    const isLastChild = isLastChildRow(row, rows, scroll + index);
    out.push(listRow(toolRowText(row, expandedTasks, isSelected, isLastChild, theme), width, isSelected, theme));
  }
  return out;
}
