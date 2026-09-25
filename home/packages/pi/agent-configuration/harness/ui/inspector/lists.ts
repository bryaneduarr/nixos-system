import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { ActivityStatus, ToolActivity } from "../../activity/store.ts";
import { isHarnessTool } from "../../tools/config.ts";
import { toolLabel, toolTarget } from "../tool-renderer.ts";
import { formatDuration, formatValue, type InspectorRow } from "./detail.ts";
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

function statusGlyph(status: ActivityStatus, theme: Theme): string {
  switch (status) {
    case "running": return theme.fg("warning", "●");
    case "error": return theme.fg("error", "✗");
    default: return theme.fg("success", "✓");
  }
}

interface ToolListOptions {
  rows: InspectorRow[];
  width: number;
  height: number;
  scroll: number;
  selected: number;
  expandedTasks: ReadonlySet<string>;
  theme: Theme;
}

export function renderToolList({
  rows, width, height, scroll, selected, expandedTasks, theme,
}: ToolListOptions): string[] {
  const out: string[] = [];
  for (let index = 0; index < height; index += 1) {
    const row = rows[scroll + index];
    if (!row) {
      out.push(padCell("", width));
      continue;
    }
    const tool = row.sub?.toolName ?? row.entry.toolName;
    const args = row.sub?.args ?? row.entry.args;
    const status = row.sub?.status ?? row.entry.status;
    const target = isHarnessTool(tool)
      ? toolTarget(tool, args)
      : tool === "message" || tool === "thinking" || tool === "update"
        ? oneSentence(row.entry.text)
        : oneSentence(formatValue(args));
    const hasChildren = !row.sub && row.entry.sub.length > 0;
    const disclosure = hasChildren
      ? expandedTasks.has(row.entry.id) ? "▾ " : "▸ "
      : row.sub ? "  ↳ " : "  ";
    const elapsed = formatDuration(Math.max(
      0,
      (row.sub?.endedAt ?? row.entry.endedAt ?? Date.now()) -
        (row.sub?.startedAt ?? row.entry.startedAt),
    ));
    const usage = !row.sub && tool === "task"
      ? ` · ${usageLabel(row.entry.usage, row.entry.model)}` : "";
    const isSelected = scroll + index === selected;
    const label = tool === "message"
      ? `◆ MESSAGE ${String(args.number ?? "")} · ${target || "(no text)"}`
      : `${tool === "task" || row.sub ? "SUBAGENT " : ""}${toolLabel(tool)} · ${elapsed}${usage} · ${target}`;
    const text = tool === "message"
      ? theme.fg("accent", label)
      : `${statusGlyph(status, theme)} ${disclosure}${theme.fg(isSelected ? "accent" : "text", label)}`;
    const cell = padCell(truncateToWidth(text, width, "…", true), width);
    out.push(isSelected ? theme.bg("selectedBg", cell) : cell);
  }
  return out;
}

interface SubagentListOptions {
  rows: ToolActivity[];
  width: number;
  height: number;
  scroll: number;
  selectedId: string;
  theme: Theme;
}

export function renderSubagentList({
  rows, width, height, scroll, selectedId, theme,
}: SubagentListOptions): string[] {
  const totalTokens = rows.reduce((total, row) => total + (row.usage?.totalTokens ?? 0), 0);
  const output = [theme.fg(
    "muted",
    `${rows.length} subagents · spent ${formatTokens(totalTokens)} · ↑/↓ move · → open`,
  )];
  for (const [index, row] of rows.slice(scroll, scroll + height).entries()) {
    const actualIndex = scroll + index;
    const target = typeof row.args.prompt === "string" ? oneSentence(row.args.prompt) : "";
    const state = row.status === "running" ? "running" : row.status;
    const thinking = row.thinkingLevel ?? "—";
    const window = row.model?.contextWindow ? formatTokens(row.model.contextWindow) : "—";
    const elapsed = formatDuration(Math.max(0, (row.endedAt ?? Date.now()) - row.startedAt));
    const text = `${statusGlyph(row.status, theme)} SUBAGENT ${String(actualIndex + 1).padStart(2, "0")} ${state} · ${elapsed} · ${compactUsageLabel(row.usage, row.model)} · ${modelShortLabel(row.model)} · ${thinking} · win ${window} · ${target}`;
    const line = truncateToWidth(text, width, "…", true);
    output.push(row.id === selectedId ? theme.bg("selectedBg", padCell(line, width)) : line);
  }
  return output;
}
