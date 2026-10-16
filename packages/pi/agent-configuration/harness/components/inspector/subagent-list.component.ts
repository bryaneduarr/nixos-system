import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { presentValue } from "../../services/activity/value/present-value.service.ts";
import { formatDuration } from "../../services/inspector/detail/format-duration.service.ts";
import { compactUsageLabel } from "../../services/inspector/labels/compact-usage-label.service.ts";
import { formatTokens } from "../../services/inspector/labels/format-tokens.service.ts";
import { modelShortLabel } from "../../services/inspector/labels/model-short-label.service.ts";
import { oneSentence } from "../../services/inspector/labels/one-sentence.service.ts";
import { reportedUsageOf } from "../../services/inspector/labels/reported-usage-of.service.ts";
import { statusGlyph } from "../../services/inspector/labels/status-glyph.service.ts";
import { padCell } from "../../services/inspector/layout/pad-cell.service.ts";
import type { ToolActivity } from "../../types/activity/tool-activity.interface.ts";
import type { SubagentListOptions } from "../../types/inspector/lists/subagent-list-options.interface.ts";

function subagentTarget(row: ToolActivity): string {
  if (typeof row.args.title === "string") return oneSentence(row.args.title);
  if (typeof row.args.prompt === "string") return oneSentence(row.args.prompt);
  return "";
}

function subagentLine(row: ToolActivity, rowNumber: number, width: number, theme: Theme): string {
  const thinking = presentValue(row.thinkingLevel) ?? "—";
  const subagentModel = presentValue(row.model);
  const contextWindow = subagentModel === undefined ? undefined : presentValue(subagentModel.contextWindow);
  const window = contextWindow ? formatTokens(contextWindow) : "—";
  const elapsed = formatDuration(Math.max(0, (presentValue(row.endedAt) ?? Date.now()) - row.startedAt));
  const usage = compactUsageLabel(reportedUsageOf(row.usage), subagentModel);
  const model = modelShortLabel(subagentModel);
  const identity = `${statusGlyph(row.status, theme)} SUBAGENT ${String(rowNumber).padStart(2, "0")} ${row.status}`;
  const details = [elapsed, usage, model, thinking, `win ${window}`, subagentTarget(row)].join(" · ");
  return truncateToWidth(`${identity} · ${details}`, width, "…", true);
}

export function renderSubagentList({ rows, width, height, scroll, selection, theme }: SubagentListOptions): string[] {
  const totalTokens = rows.reduce((total, row) => total + (reportedUsageOf(row.usage)?.totalTokens ?? 0), 0);
  const output = [
    theme.fg("muted", `${rows.length} subagents · spent ${formatTokens(totalTokens)} · ↑/↓ move · → open`),
  ];
  for (const [index, row] of rows.slice(scroll, scroll + height).entries()) {
    const line = subagentLine(row, scroll + index + 1, width, theme);
    const isSelected = selection.kind === "selected" && row.id === selection.id;
    output.push(isSelected ? theme.bg("selectedBg", padCell(line, width)) : line);
  }
  return output;
}
