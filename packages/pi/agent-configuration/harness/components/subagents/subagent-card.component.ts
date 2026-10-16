import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import {
  CARD_BOX_TITLE,
  CARD_CANCELLED_LABEL,
  CARD_DONE_LABEL,
  CARD_FAILED_LABEL,
  CARD_NO_TOOL_CALLS_LABEL,
  CARD_RUNNING_LABEL,
  CARD_TIME_LABEL,
  CARD_TITLE_FALLBACK,
  CARD_TOOL_TARGET_FIELDS,
  MILLISECONDS_PER_SECOND,
} from "../../constants/subagents/card.constant.ts";
import { COMPLETED_TASK_LABEL, STARTING_TASK_LABEL } from "../../constants/subagents/progress.constant.ts";
import { readToolActivity } from "../../services/activity/store/read-tool-activity.service.ts";
import { presentValue } from "../../services/activity/value/present-value.service.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { oneLine } from "../../services/tool-rendering/text/one-line.service.ts";
import type { SubToolActivity } from "../../types/activity/sub-tool-activity.interface.ts";
import type { ValueState } from "../../types/activity/value-state.interface.ts";
import type { TaskProgressLookup } from "../../types/subagents/tasks/task-progress-lookup.interface.ts";
import type { TaskStatus } from "../../types/subagents/tasks/task-status.interface.ts";
import { EMPTY } from "../tool-rendering/empty.component.ts";
import { ToolBox } from "../tool-rendering/tool-box.component.ts";

function duration(startedAt: number, endedAt: number): string {
  const elapsed = Math.max(0, endedAt - startedAt);
  if (elapsed < MILLISECONDS_PER_SECOND) return `${elapsed} ms`;

  const seconds = (elapsed / MILLISECONDS_PER_SECOND).toFixed(1);
  return `${seconds} s`;
}

function toolTarget(call: SubToolActivity): string {
  for (const key of CARD_TOOL_TARGET_FIELDS) {
    const targetValue = call.args[key];
    if (typeof targetValue === "string" && targetValue.trim()) return oneLine(targetValue);
  }

  return "";
}

function toolStatusLabel(status: SubToolActivity["status"]): string {
  if (status === "running") return CARD_RUNNING_LABEL;
  if (status === "error") return CARD_FAILED_LABEL;

  return CARD_DONE_LABEL;
}

function toolStatusColor(status: SubToolActivity["status"]): ThemeColor {
  if (status === "running") return "warning";
  if (status === "error") return "error";

  return "success";
}

function callLines(theme: Theme, call: SubToolActivity): string[] {
  const target = toolTarget(call);
  const toolName = call.toolName.toUpperCase();
  const toolLabel = target ? `${toolName} ${target}` : toolName;
  const lines = [theme.fg("text", toolLabel), theme.fg(toolStatusColor(call.status), toolStatusLabel(call.status))];

  const callEndedAt = presentValue(call.endedAt);
  if (callEndedAt !== undefined) {
    lines.push(theme.fg("muted", `${CARD_TIME_LABEL} ${duration(call.startedAt, callEndedAt)}`));
  }

  return lines;
}

function idleLines(theme: Theme, status: TaskStatus): string[] {
  const startLabel = status === "running" ? STARTING_TASK_LABEL : CARD_NO_TOOL_CALLS_LABEL;
  return [theme.fg("muted", startLabel)];
}

function finalStatusLabel(status: TaskStatus): string {
  if (status === "success") return COMPLETED_TASK_LABEL;
  if (status === "cancelled") return CARD_CANCELLED_LABEL;

  return CARD_FAILED_LABEL;
}

function finalStatusLine(theme: Theme, status: TaskStatus): string {
  return theme.fg(status === "success" ? "success" : "error", finalStatusLabel(status));
}

export function renderSubagentCard(
  theme: Theme,
  toolCallId: string,
  title: string,
  progressLookup: TaskProgressLookup,
  lastComponent: ValueState<Component>,
): Component {
  const activityLookup = readToolActivity(toolCallId);
  const recordedEntry = activityLookup.found ? activityLookup.entry : undefined;
  const storedProgress = recordedEntry ? presentValue(recordedEntry.details) : undefined;
  const liveProgress = progressLookup.found ? progressLookup.progress : undefined;
  const current = liveProgress ?? storedProgress;

  const candidateTitles = [current?.title, title, recordedEntry?.args.title];
  const label =
    candidateTitles.find(
      (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0,
    ) ?? CARD_TITLE_FALLBACK;
  const status: TaskStatus = current?.status ?? recordedEntry?.status ?? "running";
  const calls = liveProgress?.activity ?? recordedEntry?.sub ?? [];
  const call = calls.findLast((toolCall) => toolCall.status === "running") ?? calls.at(-1);
  const activity = call ? callLines(theme, call) : idleLines(theme, status);
  const lines = [theme.fg("text", oneLine(label)), ...activity];

  if (status !== "running") {
    lines.push(finalStatusLine(theme, status));
  }

  const previousComponent = presentValue(lastComponent);
  const box = previousComponent instanceof ToolBox ? previousComponent : new ToolBox(theme, "", [], "accent", false);
  const boxTitle = theme.fg("toolTitle", theme.bold(CARD_BOX_TITLE));
  const titleLine = status === "running" ? `${theme.fg("accent", "/")} ${boxTitle}` : boxTitle;
  const color = status === "error" ? "error" : "accent";
  const elapsedStartedAt = call?.status === "running" ? call.startedAt : undefined;

  box.setContent({
    title: titleLine,
    lines,
    toolCall: toValueState(toolCallId),
    color,
    elapsedStartedAt: toValueState(elapsedStartedAt),
  });
  return box;
}

export function hiddenSubagentCall(): Component {
  return EMPTY;
}
