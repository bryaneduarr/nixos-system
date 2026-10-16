import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { MESSAGE_ACTIVITY_NAME } from "../../constants/activity/activity-entry.constant.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { presentValue } from "../../services/activity/value/present-value.service.ts";
import { formatDuration } from "../../services/inspector/detail/format-duration.service.ts";
import { reportedUsageOf } from "../../services/inspector/labels/reported-usage-of.service.ts";
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
  const sub = row.level === "sub" ? row.sub : undefined;
  const startedAt = sub?.startedAt ?? row.entry.startedAt;
  const endedAt =
    (sub === undefined ? undefined : presentValue(sub.endedAt)) ?? presentValue(row.entry.endedAt) ?? Date.now();
  return formatDuration(Math.max(0, endedAt - startedAt));
}

function rowUsage(row: InspectorRow, tool: string): string {
  if (row.level === "sub" || tool !== TASK_TOOL_NAME) return "";
  return ` · ${usageLabel(reportedUsageOf(row.entry.usage), presentValue(row.entry.model))}`;
}

function toolRowText(row: InspectorRow, expandedTasks: ReadonlySet<string>, isSelected: boolean, theme: Theme): string {
  const sub = row.level === "sub" ? row.sub : undefined;
  const tool = sub?.toolName ?? row.entry.toolName;
  const args = sub?.args ?? row.entry.args;
  const target = toolTargetLabel(tool, args, row.entry.text);

  if (tool === MESSAGE_ACTIVITY_NAME) {
    return theme.fg("accent", `◆ MESSAGE ${String(args.number ?? "")} · ${target || "(no text)"}`);
  }

  const status = sub?.status ?? row.entry.status;
  const prefix = tool === TASK_TOOL_NAME || sub ? "SUBAGENT " : "";
  const label = `${prefix}${toolLabel(tool)} · ${rowElapsed(row)}${rowUsage(row, tool)} · ${target}`;
  return `${statusGlyph(status, theme)} ${rowDisclosure(row, expandedTasks)}${theme.fg(isSelected ? "accent" : "text", label)}`;
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
    const cell = padCell(truncateToWidth(text, width, "…", true), width);
    out.push(isSelected ? theme.bg("selectedBg", cell) : cell);
  }
  return out;
}
