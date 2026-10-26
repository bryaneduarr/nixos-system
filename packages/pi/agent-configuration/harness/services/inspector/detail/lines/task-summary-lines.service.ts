import { BLANK_DETAIL_LINE } from "../../../../constants/inspector/detail/detail-line.constant.ts";
import { EMPTY_VALUE_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import { SUMMARY_LABEL_WIDTH } from "../../../../constants/inspector/format/format.constant.ts";
import { SUBAGENT_STATUS_TEXT } from "../../../../constants/inspector/labels/subagent-status.constant.ts";
import { THEME_ACCENT } from "../../../../constants/split-view/theme-color.constant.ts";
import type { SubToolActivity } from "../../../../types/activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { ToolActivityUsage } from "../../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import type { ToolActivity } from "../../../../types/activity/store/tool-activity.interface.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import { formatDuration } from "../../format/format-duration.service.ts";
import { formatTime } from "../../format/format-time.service.ts";
import { formatTokens } from "../../format/format-tokens.service.ts";
import { contextUsageLabel } from "../../labels/context/context-usage-label.service.ts";
import { modelLabel } from "../../labels/model/model-label.service.ts";
import { readSubagentElapsed } from "../../subagents/read-subagent-elapsed.service.ts";
import { readSubagentStatus } from "../../subagents/read-subagent-status.service.ts";

function summaryField(label: string, text: string): DetailLine {
  return { text: `${label.padEnd(SUMMARY_LABEL_WIDTH)}${text}`, color: THEME_ACCENT, bold: false };
}

function argumentText(entry: ToolActivity, key: string): string {
  const argument = entry.args[key];
  return typeof argument === "string" && argument.trim() ? argument : EMPTY_VALUE_LABEL;
}

function titleText(entry: ToolActivity): string {
  return entry.details.state === "present" ? entry.details.value.title : argumentText(entry, "title");
}

function roleText(entry: ToolActivity): string {
  return entry.details.state === "present" ? entry.details.value.role : argumentText(entry, "role");
}

function stepText(entry: ToolActivity): string {
  if (entry.details.state === "absent") return "";
  return `  ${entry.details.value.currentTask}`;
}

function toolCountText(calls: readonly SubToolActivity[]): string {
  const running = calls.filter((call) => call.status === "running").length;
  const failed = calls.filter((call) => call.status === "error").length;
  return `${calls.length} calls  ${running} running  ${failed} failed`;
}

function tokenText(usage: ToolActivityUsage): string {
  if (usage.usageState === "unreported") return `total ${EMPTY_VALUE_LABEL}`;
  const { totalTokens, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, reasoningTokens } = usage.usage;
  return [
    `total ${formatTokens(totalTokens)}`,
    `input ${formatTokens(inputTokens)}`,
    `output ${formatTokens(outputTokens)}`,
    `cache read ${formatTokens(cacheReadTokens)}`,
    `cache write ${formatTokens(cacheWriteTokens)}`,
    `reasoning ${formatTokens(reasoningTokens)}`,
  ].join("  ");
}

function peakText(usage: ToolActivityUsage): string {
  if (usage.usageState === "unreported" || usage.usage.maxContextTokens.state === "absent") return "";
  return `  peak ${formatTokens(usage.usage.maxContextTokens.value)}`;
}

export function taskSummaryLines(entry: ToolActivity): DetailLine[] {
  const status = SUBAGENT_STATUS_TEXT[readSubagentStatus(entry)];
  const reasoning = entry.thinkingLevel.state === "present" ? entry.thinkingLevel.value : EMPTY_VALUE_LABEL;
  const elapsed = formatDuration(readSubagentElapsed(entry));

  return [
    { text: titleText(entry), color: THEME_ACCENT, bold: true },
    BLANK_DETAIL_LINE,
    summaryField("ROLE", roleText(entry)),
    { ...summaryField("STATUS", `${status.label}${stepText(entry)}`), color: status.color },
    summaryField("MODEL", modelLabel(entry.model)),
    summaryField("REASONING", reasoning),
    summaryField("TIME", `${elapsed}  started ${formatTime(entry.startedAt)}`),
    summaryField("TOOLS", toolCountText(entry.sub)),
    summaryField("TOKENS", tokenText(entry.usage)),
    summaryField("CONTEXT", `${contextUsageLabel(entry.usage, entry.model)}${peakText(entry.usage)}`),
    BLANK_DETAIL_LINE,
  ];
}
