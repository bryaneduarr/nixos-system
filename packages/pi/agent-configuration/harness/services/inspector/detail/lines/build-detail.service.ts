import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import { MESSAGE_ACTIVITY_NAME } from "../../../../constants/activity/activity-entry.constant.ts";
import { BLANK_DETAIL_LINE } from "../../../../constants/inspector/detail-line.constant.ts";
import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles.constant.ts";
import type { ActivityStatus } from "../../../../types/activity/store/activity-status.interface.ts";
import type { ToolActivity } from "../../../../types/activity/store/tool-activity.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { DetailArtifact } from "../../../../types/inspector/detail/detail-artifact.interface.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import type { DetailOptions } from "../../../../types/inspector/detail/detail-options.interface.ts";
import { toolColor } from "../../../tool-rendering/labels/tool-color.service.ts";
import { toolLabel } from "../../../tool-rendering/labels/tool-label.service.ts";
import { toolTarget } from "../../../tool-rendering/labels/tool-target.service.ts";
import { isHarnessTool } from "../../../tools/active-tools/is-harness-tool.service.ts";
import { isPseudoEntryTool } from "../../entries/is-pseudo-entry-tool.service.ts";
import { readEndedAt } from "../../entries/read-ended-at.service.ts";
import { formatDuration } from "../../format/format-duration.service.ts";
import { formatTime } from "../../format/format-time.service.ts";
import { formatInput } from "../content/format-input.service.ts";
import { formatOutput } from "../content/format-output.service.ts";
import { boxedDetailLines } from "./boxed-detail-lines.service.ts";
import { pseudoEntryLines } from "./pseudo-entry-lines.service.ts";
import { taskSummaryLines } from "./task-summary-lines.service.ts";

const RUNNING_LABEL = "  running";

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
  const artifactAction = artifact.kind === "loaded" ? "open" : "press a";
  return [
    { text: `artifact ${artifactAction}  ${entry.artifactPath.path}`, color: "muted", bold: false },
    BLANK_DETAIL_LINE,
  ];
}

function detailColor(tool: string): ThemeColor {
  if (isHarnessTool(tool)) return toolColor(tool);
  return isPseudoEntryTool(tool) ? "accent" : "muted";
}

function detailHeading(
  tool: string,
  args: Record<string, unknown>,
  status: ActivityStatus,
  startedAt: number,
): DetailLine {
  if (tool === MESSAGE_ACTIVITY_NAME) {
    return {
      text: `USER MESSAGE ${String(args.number ?? "")}  ${formatTime(startedAt)}`,
      color: "accent",
      bold: true,
    };
  }
  const text = `${toolLabel(tool)}  ${status.toUpperCase()}  ${formatTime(startedAt)}`;
  return { text, color: statusColor(status), bold: true };
}

function timingLabel(startedAt: number, endedAt: ValueState<number>): string {
  const endTime = endedAt.state === "present" ? endedAt.value : Date.now();
  const elapsed = formatDuration(Math.max(0, endTime - startedAt));
  const runningLabel = endedAt.state === "absent" ? RUNNING_LABEL : "";
  return `${formatTime(startedAt)}  ${elapsed}${runningLabel}`;
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
  const isChildCall = row.level === "sub";
  const call = row.level === "sub" ? row.sub : entry;
  const tool = call.toolName;
  const args = call.args;
  const startedAt = call.startedAt;
  const endedAt = readEndedAt(row);
  const rawText = artifact.kind === "loaded" ? artifact.text : call.text;
  const color = detailColor(tool);
  const timing = timingLabel(startedAt, endedAt);
  const lines: DetailLine[] = [
    detailHeading(tool, args, call.status, startedAt),
    ...targetLines(tool, args, isChildCall, color),
    BLANK_DETAIL_LINE,
  ];

  if (isPseudoEntryTool(tool)) return [...lines, ...pseudoEntryLines(tool, entry, startedAt, timing, rawText, width)];

  if (!isChildCall && tool === TASK_TOOL_NAME) lines.push(...taskSummaryLines(entry));

  lines.push({ text: `INPUT  ${timing}`, color, bold: true });
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...boxedDetailLines("input", formatInput(tool, args), color, width));
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...artifactNoticeLines(entry, artifact));

  const outputTitle = artifact.kind === "loaded" ? "ARTIFACT" : "OUTPUT";
  const outputBoxTitle = artifact.kind === "loaded" ? "json" : "result";
  lines.push({ text: outputTitle, color, bold: true });
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...boxedDetailLines(outputBoxTitle, formatOutput(rawText), color, width));
  return lines;
}
