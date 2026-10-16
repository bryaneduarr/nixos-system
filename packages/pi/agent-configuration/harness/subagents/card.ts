import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import { activityStore, type SubToolActivity } from "../activity/store.ts";
import { COMPLETED_TASK_LABEL, STARTING_TASK_LABEL } from "../constants/subagents/progress.constant.ts";
import type { TaskProgress } from "../types/subagents/tasks/task-progress.interface.ts";
import { oneLine } from "../ui/formatting.ts";
import { EMPTY, ToolBox } from "../ui/tool-renderer.ts";

const TOOL_TARGET_FIELDS = ["path", "command", "pattern", "query", "file", "prompt"];

function duration(startedAt: number, endedAt: number): string {
  const elapsed = Math.max(0, endedAt - startedAt);
  if (elapsed < 1000) return `${elapsed} ms`;

  const seconds = (elapsed / 1000).toFixed(1);
  return `${seconds} s`;
}

function toolTarget(call: SubToolActivity): string {
  for (const key of TOOL_TARGET_FIELDS) {
    const value = call.args[key];
    if (typeof value === "string" && value.trim()) return oneLine(value);
  }

  return "";
}

function toolStatusLabel(status: SubToolActivity["status"]): string {
  if (status === "running") return "Running...";
  if (status === "error") return "Failed";

  return "Done";
}

function toolStatusColor(status: SubToolActivity["status"]): ThemeColor {
  if (status === "running") return "warning";
  if (status === "error") return "error";

  return "success";
}

export function renderSubagentCard(
  theme: Theme,
  toolCallId: string | undefined,
  title: unknown,
  progress?: TaskProgress,
  lastComponent?: Component,
): Component {
  const entry = toolCallId ? activityStore.get(toolCallId) : undefined;
  const details = entry?.details as TaskProgress | undefined;
  const current = progress ?? details;
  const candidateTitles = [current?.title, title, entry?.args.title];
  const label =
    candidateTitles.find((value): value is string => typeof value === "string" && value.trim().length > 0) ??
    "Preparing task";
  const status = current?.status ?? entry?.status ?? "running";
  const calls = current?.activity ?? entry?.sub ?? [];
  const lines = [theme.fg("text", oneLine(label))];
  const call = calls.findLast((item) => item.status === "running") ?? calls.at(-1);

  if (call) {
    const target = toolTarget(call);
    const toolName = call.toolName.toUpperCase();
    const toolLabel = target ? `${toolName} ${target}` : toolName;
    lines.push(theme.fg("text", toolLabel));
    lines.push(theme.fg(toolStatusColor(call.status), toolStatusLabel(call.status)));

    if (call.endedAt !== undefined) {
      lines.push(theme.fg("muted", `Time: ${duration(call.startedAt, call.endedAt)}`));
    }
  } else {
    const startLabel = status === "running" ? STARTING_TASK_LABEL : "No tool calls";
    lines.push(theme.fg("muted", startLabel));
  }

  if (status !== "running") {
    const isSuccessful = status === "success";
    const isCancelled = status === "cancelled";
    const finalLabel = isSuccessful ? COMPLETED_TASK_LABEL : isCancelled ? "Cancelled" : "Failed";
    const finalColor = isSuccessful ? "success" : "error";
    lines.push(theme.fg(finalColor, finalLabel));
  }

  const box = lastComponent instanceof ToolBox ? lastComponent : new ToolBox(theme, "", [], "accent", false);
  const boxTitle = theme.fg("toolTitle", theme.bold("SUBAGENT"));
  const titleLine = status === "running" ? `${theme.fg("accent", "/")} ${boxTitle}` : boxTitle;
  const color = status === "error" ? "error" : "accent";
  const elapsedStartedAt = call?.status === "running" ? call.startedAt : undefined;

  box.setContent(titleLine, lines, toolCallId, color, elapsedStartedAt);
  return box;
}

export function hiddenSubagentCall(): Component {
  return EMPTY;
}
