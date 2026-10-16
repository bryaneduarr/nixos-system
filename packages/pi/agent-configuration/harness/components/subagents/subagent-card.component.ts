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
} from "../../constants/subagents/card.constant.ts";
import { COMPLETED_TASK_LABEL, STARTING_TASK_LABEL } from "../../constants/subagents/progress.constant.ts";
import { readToolActivity } from "../../services/activity/store/read-tool-activity.service.ts";
import { presentValue } from "../../services/activity/value/present-value.service.ts";
import { oneLine } from "../../services/tool-rendering/text/one-line.service.ts";
import type { SubToolActivity } from "../../types/activity/sub-tool-activity.interface.ts";
import type { TaskProgress } from "../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskStatus } from "../../types/subagents/tasks/task-status.interface.ts";
import { EMPTY } from "../tool-rendering/empty.component.ts";
import { ToolBox } from "../tool-rendering/tool-box.component.ts";

function duration(startedAt: number, endedAt: number): string {
  const elapsed = Math.max(0, endedAt - startedAt);
  if (elapsed < 1000) return `${elapsed} ms`;

  const seconds = (elapsed / 1000).toFixed(1);
  return `${seconds} s`;
}

function toolTarget(call: SubToolActivity): string {
  for (const key of CARD_TOOL_TARGET_FIELDS) {
    const value = call.args[key];
    if (typeof value === "string" && value.trim()) return oneLine(value);
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

function activityLines(theme: Theme, status: TaskStatus, call: SubToolActivity | undefined): string[] {
  if (call) return callLines(theme, call);

  const startLabel = status === "running" ? STARTING_TASK_LABEL : CARD_NO_TOOL_CALLS_LABEL;
  return [theme.fg("muted", startLabel)];
}

function finalStatusLine(theme: Theme, status: TaskStatus): string {
  const isSuccessful = status === "success";
  const finalLabel = isSuccessful
    ? COMPLETED_TASK_LABEL
    : status === "cancelled"
      ? CARD_CANCELLED_LABEL
      : CARD_FAILED_LABEL;
  return theme.fg(isSuccessful ? "success" : "error", finalLabel);
}

export function renderSubagentCard(
  theme: Theme,
  toolCallId: string | undefined,
  title: unknown,
  progress?: TaskProgress,
  lastComponent?: Component,
): Component {
  const lookup = readToolActivity(toolCallId);
  const entry = lookup.found ? lookup.entry : undefined;
  const storedProgress = entry === undefined ? undefined : presentValue(entry.details);
  const current = progress ?? storedProgress;
  const candidateTitles = [current?.title, title, entry?.args.title];
  const label =
    candidateTitles.find((value): value is string => typeof value === "string" && value.trim().length > 0) ??
    CARD_TITLE_FALLBACK;
  const status: TaskStatus = current?.status ?? entry?.status ?? "running";
  const calls = progress?.activity ?? entry?.sub ?? [];
  const call = calls.findLast((item) => item.status === "running") ?? calls.at(-1);
  const lines = [theme.fg("text", oneLine(label)), ...activityLines(theme, status, call)];

  if (status !== "running") {
    lines.push(finalStatusLine(theme, status));
  }

  const box = lastComponent instanceof ToolBox ? lastComponent : new ToolBox(theme, "", [], "accent", false);
  const boxTitle = theme.fg("toolTitle", theme.bold(CARD_BOX_TITLE));
  const titleLine = status === "running" ? `${theme.fg("accent", "/")} ${boxTitle}` : boxTitle;
  const color = status === "error" ? "error" : "accent";
  const elapsedStartedAt = call?.status === "running" ? call.startedAt : undefined;

  box.setContent(titleLine, lines, toolCallId, color, elapsedStartedAt);
  return box;
}

export function hiddenSubagentCall(): Component {
  return EMPTY;
}
