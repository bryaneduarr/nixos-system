import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { ROW_NUMBER_WIDTH } from "../../constants/inspector/format.constant.ts";
import { EMPTY_VALUE_LABEL, TRUNCATION_MARK } from "../../constants/inspector/label.constant.ts";
import { SELECTED_ROW_BACKGROUND } from "../../constants/inspector/theme-color.constant.ts";
import { formatDuration } from "../../services/inspector/detail/format-duration.service.ts";
import { compactUsageLabel } from "../../services/inspector/labels/compact-usage-label.service.ts";
import { contextWindowLabel } from "../../services/inspector/labels/context-window-label.service.ts";
import { formatTokens } from "../../services/inspector/labels/format-tokens.service.ts";
import { modelShortLabel } from "../../services/inspector/labels/model-short-label.service.ts";
import { oneSentence } from "../../services/inspector/labels/one-sentence.service.ts";
import { statusGlyph } from "../../services/inspector/labels/status-glyph.service.ts";
import { padCell } from "../../services/inspector/layout/pad-cell.service.ts";
import { isSubagentSelected } from "../../services/inspector/subagents/is-subagent-selected.service.ts";
import type { ToolActivity } from "../../types/activity/tool-activity.interface.ts";
import type { ToolActivityUsage } from "../../types/activity/tool-activity-usage.interface.ts";
import type { SubagentListOptions } from "../../types/inspector/lists/subagent-list-options.interface.ts";

function subagentTarget(row: ToolActivity): string {
  if (typeof row.args.title === "string") return oneSentence(row.args.title);
  if (typeof row.args.prompt === "string") return oneSentence(row.args.prompt);
  return "";
}

function subagentLine(row: ToolActivity, rowNumber: number, width: number, theme: Theme): string {
  const thinking = row.thinkingLevel.state === "present" ? row.thinkingLevel.value : EMPTY_VALUE_LABEL;
  const windowLabel = contextWindowLabel(row.model);
  const endTime = row.endedAt.state === "present" ? row.endedAt.value : Date.now();
  const elapsed = formatDuration(Math.max(0, endTime - row.startedAt));
  const usage = compactUsageLabel(row.usage, row.model);
  const model = modelShortLabel(row.model);
  const rowNumberLabel = String(rowNumber).padStart(ROW_NUMBER_WIDTH, "0");
  const identity = `${statusGlyph(row.status, theme)} SUBAGENT ${rowNumberLabel} ${row.status}`;
  const details = [elapsed, usage, model, thinking, `win ${windowLabel}`, subagentTarget(row)].join(" · ");
  return truncateToWidth(`${identity} · ${details}`, width, TRUNCATION_MARK, true);
}

function reportedTotalTokens(usage: ToolActivityUsage): number {
  return usage.usageState === "reported" ? usage.usage.totalTokens : 0;
}

export function renderSubagentList({ rows, width, height, scroll, selection, theme }: SubagentListOptions): string[] {
  const totalTokens = rows.reduce((total, row) => total + reportedTotalTokens(row.usage), 0);
  const output = [
    theme.fg("muted", `${rows.length} subagents · spent ${formatTokens(totalTokens)} · ↑/↓ move · → open`),
  ];
  for (const [index, row] of rows.slice(scroll, scroll + height).entries()) {
    const line = subagentLine(row, scroll + index + 1, width, theme);
    const isSelected = isSubagentSelected(row, selection);
    output.push(isSelected ? theme.bg(SELECTED_ROW_BACKGROUND, padCell(line, width)) : line);
  }
  return output;
}
