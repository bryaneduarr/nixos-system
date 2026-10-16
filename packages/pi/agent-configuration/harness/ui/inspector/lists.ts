import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { ActivityStatus } from "../../activity/store.ts";
import {
  THINKING_TOOL_NAME,
  UPDATE_TOOL_NAME,
  USER_MESSAGE_TOOL_NAME,
} from "../../constants/inspector/pseudo-tool.constant.ts";
import { TASK_TOOL_NAME } from "../../subagents/roles.ts";
import { isHarnessTool } from "../../tools/config.ts";
import type { SubagentListOptions } from "../../types/inspector/lists/subagent-list-options.interface.ts";
import type { ToolListOptions } from "../../types/inspector/lists/tool-list-options.interface.ts";
import { toolLabel, toolTarget } from "../tool-renderer.ts";
import { formatDuration, formatValue } from "./detail.ts";
import { compactUsageLabel, formatTokens, modelShortLabel, usageLabel } from "./usage.ts";

function padCell(text: string, width: number): string {
  const missing = width - visibleWidth(text);
  return missing > 0 ? `${text}${" ".repeat(missing)}` : text;
}

function oneSentence(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const end = /[.!?](?:\s|$)/.exec(normalized);
  return normalized.slice(0, Math.min(end ? end.index + 1 : normalized.length, 160));
}

function targetForTool(tool: string, args: Record<string, unknown>, text: string): string {
  if (tool === TASK_TOOL_NAME && typeof args.title === "string") return args.title;
  if (isHarnessTool(tool)) return toolTarget(tool, args);
  if (tool === USER_MESSAGE_TOOL_NAME || tool === THINKING_TOOL_NAME || tool === UPDATE_TOOL_NAME) {
    return oneSentence(text);
  }

  return oneSentence(formatValue(args));
}

function statusGlyph(status: ActivityStatus, theme: Theme): string {
  switch (status) {
    case "running":
      return theme.fg("warning", "●");
    case "error":
      return theme.fg("error", "✗");
    default:
      return theme.fg("success", "✓");
  }
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
    const sub = row.level === "sub" ? row.sub : undefined;
    const tool = sub?.toolName ?? row.entry.toolName;
    const args = sub?.args ?? row.entry.args;
    const status = sub?.status ?? row.entry.status;
    const target = targetForTool(tool, args, row.entry.text);
    const hasChildren = !sub && row.entry.sub.length > 0;
    const disclosure = hasChildren ? (expandedTasks.has(row.entry.id) ? "▾ " : "▸ ") : sub ? "  ↳ " : "  ";
    const startedAt = sub?.startedAt ?? row.entry.startedAt;
    const endedAt = sub?.endedAt ?? row.entry.endedAt ?? Date.now();
    const elapsed = formatDuration(Math.max(0, endedAt - startedAt));
    const usage = !sub && tool === TASK_TOOL_NAME ? ` · ${usageLabel(row.entry.usage, row.entry.model)}` : "";
    const isSelected = scroll + index === selected;
    const label =
      tool === USER_MESSAGE_TOOL_NAME
        ? `◆ MESSAGE ${String(args.number ?? "")} · ${target || "(no text)"}`
        : `${tool === TASK_TOOL_NAME || sub ? "SUBAGENT " : ""}${toolLabel(tool)} · ${elapsed}${usage} · ${target}`;
    const text =
      tool === USER_MESSAGE_TOOL_NAME
        ? theme.fg("accent", label)
        : `${statusGlyph(status, theme)} ${disclosure}${theme.fg(isSelected ? "accent" : "text", label)}`;
    const cell = padCell(truncateToWidth(text, width, "…", true), width);
    out.push(isSelected ? theme.bg("selectedBg", cell) : cell);
  }
  return out;
}

export function renderSubagentList({ rows, width, height, scroll, selection, theme }: SubagentListOptions): string[] {
  const totalTokens = rows.reduce((total, row) => total + (row.usage?.totalTokens ?? 0), 0);
  const output = [
    theme.fg("muted", `${rows.length} subagents · spent ${formatTokens(totalTokens)} · ↑/↓ move · → open`),
  ];
  for (const [index, row] of rows.slice(scroll, scroll + height).entries()) {
    const actualIndex = scroll + index;
    let target = "";
    if (typeof row.args.title === "string") {
      target = oneSentence(row.args.title);
    } else if (typeof row.args.prompt === "string") {
      target = oneSentence(row.args.prompt);
    }
    const state = row.status === "running" ? "running" : row.status;
    const thinking = row.thinkingLevel ?? "—";
    const window = row.model?.contextWindow ? formatTokens(row.model.contextWindow) : "—";
    const elapsed = formatDuration(Math.max(0, (row.endedAt ?? Date.now()) - row.startedAt));
    const rowNumber = String(actualIndex + 1).padStart(2, "0");
    const usage = compactUsageLabel(row.usage, row.model);
    const model = modelShortLabel(row.model);
    const identity = `${statusGlyph(row.status, theme)} SUBAGENT ${rowNumber} ${state}`;
    const details = [elapsed, usage, model, thinking, `win ${window}`, target].join(" · ");
    const text = `${identity} · ${details}`;
    const line = truncateToWidth(text, width, "…", true);
    const isSelected = selection.kind === "selected" && row.id === selection.id;
    output.push(isSelected ? theme.bg("selectedBg", padCell(line, width)) : line);
  }
  return output;
}
