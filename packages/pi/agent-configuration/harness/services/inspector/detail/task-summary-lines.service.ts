import { BLANK_DETAIL_LINE } from "../../../constants/inspector/detail-line.constant.ts";
import { SUMMARY_LABEL_WIDTH } from "../../../constants/inspector/format.constant.ts";
import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/label.constant.ts";
import { SUBAGENT_STATUS_TEXT } from "../../../constants/inspector/subagent-status.constant.ts";
import type { SubToolActivity } from "../../../types/activity/sub-tool-activity.interface.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import type { ToolActivityUsage } from "../../../types/activity/tool-activity-usage.interface.ts";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import { contextUsageLabel } from "../labels/context-usage-label.service.ts";
import { formatTokens } from "../labels/format-tokens.service.ts";
import { modelLabel } from "../labels/model-label.service.ts";
import { readSubagentElapsed } from "../subagents/read-subagent-elapsed.service.ts";
import { readSubagentStatus } from "../subagents/read-subagent-status.service.ts";
import { formatDuration } from "./format-duration.service.ts";
import { formatTime } from "./format-time.service.ts";

function summaryLine(label: string, text: string): DetailLine {
  return { text: `${label.padEnd(SUMMARY_LABEL_WIDTH)}${text}`, color: "accent", bold: false };
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
    { text: titleText(entry), color: "accent", bold: true },
    BLANK_DETAIL_LINE,
    summaryLine("ROLE", roleText(entry)),
    { ...summaryLine("STATUS", `${status.label}${stepText(entry)}`), color: status.color },
    summaryLine("MODEL", modelLabel(entry.model)),
    summaryLine("REASONING", reasoning),
    summaryLine("TIME", `${elapsed}  started ${formatTime(entry.startedAt)}`),
    summaryLine("TOOLS", toolCountText(entry.sub)),
    summaryLine("TOKENS", tokenText(entry.usage)),
    summaryLine("CONTEXT", `${contextUsageLabel(entry.usage, entry.model)}${peakText(entry.usage)}`),
    BLANK_DETAIL_LINE,
  ];
}
