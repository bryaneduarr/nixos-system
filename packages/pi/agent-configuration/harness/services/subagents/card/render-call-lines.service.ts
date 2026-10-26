import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import { THEME_MUTED, THEME_TEXT } from "../../../constants/split-view/theme-color.constant.ts";
import {
  CARD_DONE_LABEL,
  CARD_TIME_LABEL,
  CARD_TOOL_TARGET_FIELDS,
} from "../../../constants/subagents/card/card.constant.ts";
import { MILLISECONDS_PER_SECOND } from "../../../constants/time/time-unit.constant.ts";
import {
  FAILED_LABEL,
  PRESENTATION_RUNNING_LABEL,
} from "../../../constants/tool-rendering/presentation/presentation-label.constant.ts";
import type { SubToolActivity } from "../../../types/activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { SubagentCardTheme } from "../../../types/subagents/card/subagent-card-theme.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/progress/task-status.interface.ts";
import { oneLine } from "../../tool-rendering/text/one-line.service.ts";

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
  if (status === "running") return PRESENTATION_RUNNING_LABEL;
  if (status === "error") return FAILED_LABEL;

  return CARD_DONE_LABEL;
}

function toolStatusColor(status: SubToolActivity["status"]): ThemeColor {
  if (status === "running") return "warning";
  if (status === "error") return "error";

  return "success";
}

export function renderCallLines(theme: SubagentCardTheme, call: SubToolActivity, taskStatus: TaskStatus): string[] {
  const target = toolTarget(call);
  const toolName = call.toolName.toUpperCase();
  const toolLabel = target ? `${toolName} ${target}` : toolName;
  // A finished call of a running subagent must not read as Done; the subagent is still working.
  const shownStatus = taskStatus === "running" ? "running" : call.status;
  const lines = [theme.fg(THEME_TEXT, toolLabel), theme.fg(toolStatusColor(shownStatus), toolStatusLabel(shownStatus))];

  if (call.endedAt.state === "present") {
    lines.push(theme.fg(THEME_MUTED, `${CARD_TIME_LABEL} ${duration(call.startedAt, call.endedAt.value)}`));
  }

  return lines;
}
