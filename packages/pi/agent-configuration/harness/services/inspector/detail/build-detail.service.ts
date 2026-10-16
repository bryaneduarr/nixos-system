import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../constants/activity/activity-entry.constant.ts";
import { BLANK_DETAIL_LINE } from "../../../constants/inspector/detail-line.constant.ts";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import type { ActivityStatus } from "../../../types/activity/activity-status.interface.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import type { DetailArtifact } from "../../../types/inspector/detail/detail-artifact.interface.ts";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import type { DetailOptions } from "../../../types/inspector/detail/detail-options.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";
import { toolColor } from "../../tool-rendering/presentation/tool-color.service.ts";
import { toolLabel } from "../../tool-rendering/presentation/tool-label.service.ts";
import { toolTarget } from "../../tool-rendering/presentation/tool-target.service.ts";
import { isHarnessTool } from "../../tools/is-harness-tool.service.ts";
import { boxDetails } from "./box-details.service.ts";
import { formatDuration } from "./format-duration.service.ts";
import { formatInput } from "./format-input.service.ts";
import { formatOutput } from "./format-output.service.ts";
import { formatTime } from "./format-time.service.ts";
import { pseudoEntryLines } from "./pseudo-entry-lines.service.ts";
import { taskSummaryLines } from "./task-summary-lines.service.ts";

function statusColor(status: ActivityStatus): ThemeColor {
  switch (status) {
    case "running":
      return "warning";
    case "error":
      return "error";
    default:
      return "success";
  }
}

function artifactNoticeLines(entry: ToolActivity, artifact: DetailArtifact): DetailLine[] {
  if (!entry.artifactPath.found) return [];
  const artifactAction = artifact.kind === "loaded" ? "· open" : "· press a";
  return [
    { text: `artifact ${artifactAction} · ${entry.artifactPath.path}`, color: "muted", bold: false },
    BLANK_DETAIL_LINE,
  ];
}

function isPseudoEntry(tool: string): boolean {
  return tool === MESSAGE_ACTIVITY_NAME || tool === UPDATE_ACTIVITY_NAME || tool === THINKING_ACTIVITY_NAME;
}

function detailColor(tool: string): ThemeColor {
  if (isHarnessTool(tool)) return toolColor(tool);
  return isPseudoEntry(tool) ? "accent" : "muted";
}

function detailHeading(
  tool: string,
  args: Record<string, unknown>,
  status: ActivityStatus,
  startedAt: number,
): DetailLine {
  if (tool === MESSAGE_ACTIVITY_NAME) {
    return {
      text: `USER MESSAGE ${String(args.number ?? "")} · ${formatTime(startedAt)}`,
      color: "accent",
      bold: true,
    };
  }
  const text = `${toolLabel(tool)} · ${status.toUpperCase()} · ${formatTime(startedAt)}`;
  return { text, color: statusColor(status), bold: true };
}

function timingLabel(startedAt: number, endedAt: number | undefined): string {
  const elapsed = formatDuration(Math.max(0, (endedAt ?? Date.now()) - startedAt));
  const runningLabel = endedAt === undefined ? " · running" : "";
  return `${formatTime(startedAt)} · ${elapsed}${runningLabel}`;
}

function targetLines(
  tool: string,
  args: Record<string, unknown>,
  isChildCall: boolean,
  color: ThemeColor,
): DetailLine[] {
  if (tool === TASK_TOOL_NAME && !isChildCall) return [];
  const target = isHarnessTool(tool) ? toolTarget(tool, args) : tool;
  return [{ text: target, color, bold: true }];
}

export function buildDetail({ row, width, artifact }: DetailOptions): DetailLine[] {
  const entry = row.entry;
  const sub = row.level === "sub" ? row.sub : undefined;
  const tool = sub?.toolName ?? entry.toolName;
  const args = sub?.args ?? entry.args;
  const status = sub?.status ?? entry.status;
  const startedAt = sub?.startedAt ?? entry.startedAt;
  const endedAt = (sub === undefined ? undefined : presentValue(sub.endedAt)) ?? presentValue(entry.endedAt);
  const rawText = artifact.kind === "loaded" ? artifact.text : (sub?.text ?? entry.text);
  const color = detailColor(tool);
  const timing = timingLabel(startedAt, endedAt);
  const lines: DetailLine[] = [
    detailHeading(tool, args, status, startedAt),
    ...targetLines(tool, args, sub !== undefined, color),
    BLANK_DETAIL_LINE,
  ];

  const pseudoBody = pseudoEntryLines(tool, entry, startedAt, timing, rawText, width);
  if (pseudoBody) return [...lines, ...pseudoBody];

  if (!sub && tool === TASK_TOOL_NAME) lines.push(...taskSummaryLines(entry));

  lines.push({ text: `INPUT  ${timing}`, color, bold: true });
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...boxDetails("input", formatInput(tool, args), color, width));
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...artifactNoticeLines(entry, artifact));

  const outputTitle = artifact.kind === "loaded" ? "ARTIFACT" : "OUTPUT";
  const outputBoxTitle = artifact.kind === "loaded" ? "json" : "result";
  lines.push({ text: outputTitle, color, bold: true });
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...boxDetails(outputBoxTitle, formatOutput(rawText), color, width));
  return lines;
}
