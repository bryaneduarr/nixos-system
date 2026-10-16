import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { MESSAGE_ACTIVITY_NAME } from "../../constants/activity/activity-entry.constant.ts";
import { NO_TEXT_LABEL, TRUNCATION_MARK } from "../../constants/inspector/label.constant.ts";
import { SELECTED_ROW_BACKGROUND } from "../../constants/inspector/theme-color.constant.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { formatDuration } from "../../services/inspector/detail/format-duration.service.ts";
import { readEndedAt } from "../../services/inspector/detail/read-ended-at.service.ts";
import { statusGlyph } from "../../services/inspector/labels/status-glyph.service.ts";
import { toolTargetLabel } from "../../services/inspector/labels/tool-target-label.service.ts";
import { usageLabel } from "../../services/inspector/labels/usage-label.service.ts";
import { padCell } from "../../services/inspector/layout/pad-cell.service.ts";
import { toolLabel } from "../../services/tool-rendering/presentation/tool-label.service.ts";
import type { InspectorRow } from "../../types/inspector/detail/inspector-row.interface.ts";
import type { ToolListOptions } from "../../types/inspector/lists/tool-list-options.interface.ts";

function rowDisclosure(row: InspectorRow, expandedTasks: ReadonlySet<string>): string {
  if (row.level === "sub") return "  ↳ ";
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
  return ` · ${usageLabel(row.entry.usage, row.entry.model)}`;
}

function toolRowText(row: InspectorRow, expandedTasks: ReadonlySet<string>, isSelected: boolean, theme: Theme): string {
  const call = row.level === "sub" ? row.sub : row.entry;
  const isChildCall = row.level === "sub";
  const target = toolTargetLabel(call.toolName, call.args, row.entry.text);

  if (call.toolName === MESSAGE_ACTIVITY_NAME) {
    return theme.fg("accent", `◆ MESSAGE ${String(call.args.number ?? "")} · ${target || NO_TEXT_LABEL}`);
  }

  const prefix = call.toolName === TASK_TOOL_NAME || isChildCall ? "SUBAGENT " : "";
  const label = `${prefix}${toolLabel(call.toolName)} · ${rowElapsed(row)}${rowUsage(row, call.toolName)} · ${target}`;
  return `${statusGlyph(call.status, theme)} ${rowDisclosure(row, expandedTasks)}${theme.fg(isSelected ? "accent" : "text", label)}`;
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
    const text = toolRowText(row, expandedTasks, isSelected, theme);
    const cell = padCell(truncateToWidth(text, width, TRUNCATION_MARK, true), width);
    out.push(isSelected ? theme.bg(SELECTED_ROW_BACKGROUND, cell) : cell);
  }
  return out;
}
