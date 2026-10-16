import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import {
  CARD_DONE_LABEL,
  CARD_FAILED_LABEL,
  CARD_RUNNING_LABEL,
  CARD_TIME_LABEL,
  CARD_TOOL_TARGET_FIELDS,
  MILLISECONDS_PER_SECOND,
} from "../../../constants/subagents/card.constant.ts";
import type { SubToolActivity } from "../../../types/activity/sub-tool-activity.interface.ts";
import type { SubagentCardTheme } from "../../../types/subagents/card/subagent-card-theme.interface.ts";
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
  if (status === "running") return CARD_RUNNING_LABEL;
  if (status === "error") return CARD_FAILED_LABEL;

  return CARD_DONE_LABEL;
}

function toolStatusColor(status: SubToolActivity["status"]): ThemeColor {
  if (status === "running") return "warning";
  if (status === "error") return "error";

  return "success";
}

export function renderCallLines(theme: SubagentCardTheme, call: SubToolActivity): string[] {
  const target = toolTarget(call);
  const toolName = call.toolName.toUpperCase();
  const toolLabel = target ? `${toolName} ${target}` : toolName;
  const lines = [theme.fg("text", toolLabel), theme.fg(toolStatusColor(call.status), toolStatusLabel(call.status))];

  if (call.endedAt.state === "present") {
    lines.push(theme.fg("muted", `${CARD_TIME_LABEL} ${duration(call.startedAt, call.endedAt.value)}`));
  }

  return lines;
}
