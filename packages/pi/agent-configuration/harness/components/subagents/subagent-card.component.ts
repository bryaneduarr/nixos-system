import type { Component } from "@earendil-works/pi-tui";
import { CARD_BOX_TITLE } from "../../constants/subagents/card.constant.ts";
import { readToolActivity } from "../../services/activity/store/read-tool-activity.service.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { renderCallLines } from "../../services/subagents/card/render-call-lines.service.ts";
import { renderFinalStatusLine } from "../../services/subagents/card/render-final-status-line.service.ts";
import { renderIdleLines } from "../../services/subagents/card/render-idle-lines.service.ts";
import { resolveCardCalls } from "../../services/subagents/card/resolve-card-calls.service.ts";
import { resolveCardProgress } from "../../services/subagents/card/resolve-card-progress.service.ts";
import { resolveCardTitle } from "../../services/subagents/card/resolve-card-title.service.ts";
import { oneLine } from "../../services/tool-rendering/text/one-line.service.ts";
import type { SubToolActivity } from "../../types/activity/sub-tool-activity.interface.ts";
import type { ToolActivityLookup } from "../../types/activity/tool-activity-lookup.interface.ts";
import type { ValueState } from "../../types/activity/value-state.interface.ts";
import type { SubagentCardTheme } from "../../types/subagents/card/subagent-card-theme.interface.ts";
import type { TaskProgress } from "../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../types/subagents/tasks/task-progress-lookup.interface.ts";
import type { TaskStatus } from "../../types/subagents/tasks/task-status.interface.ts";
import { EMPTY } from "../tool-rendering/empty.component.ts";
import { ToolBox } from "../tool-rendering/tool-box.component.ts";

function cardStatus(current: ValueState<TaskProgress>, activityLookup: ToolActivityLookup): TaskStatus {
  if (current.state === "present") return current.value.status;
  if (activityLookup.found) return activityLookup.entry.status;

  return "running";
}

function runningCallStart(calls: readonly SubToolActivity[]): ValueState<number> {
  const runningCall = calls.findLast((toolCall) => toolCall.status === "running");
  if (runningCall === undefined) return { state: "absent" };

  return { state: "present", value: runningCall.startedAt };
}

function reusableBox(theme: SubagentCardTheme, lastComponent: ValueState<Component>): ToolBox {
  if (lastComponent.state === "present" && lastComponent.value instanceof ToolBox) return lastComponent.value;

  return new ToolBox(theme, "", [], "accent", false);
}

export function renderSubagentCard(
  theme: SubagentCardTheme,
  toolCallId: string,
  title: string,
  progressLookup: TaskProgressLookup,
  lastComponent: ValueState<Component>,
): Component {
  const activityLookup = readToolActivity(toolCallId);
  const current = resolveCardProgress(progressLookup, activityLookup);
  const status = cardStatus(current, activityLookup);
  const label = resolveCardTitle(current, title, activityLookup);
  const calls = resolveCardCalls(progressLookup, activityLookup);
  const call = calls.findLast((toolCall) => toolCall.status === "running") ?? calls.at(-1);
  const activity = call ? renderCallLines(theme, call) : renderIdleLines(theme, status);
  const lines = [theme.fg("text", oneLine(label)), ...activity];

  if (status !== "running") {
    lines.push(renderFinalStatusLine(theme, status));
  }

  const box = reusableBox(theme, lastComponent);
  const boxTitle = theme.fg("toolTitle", theme.bold(CARD_BOX_TITLE));
  const titleLine = status === "running" ? `${theme.fg("accent", "/")} ${boxTitle}` : boxTitle;
  const color = status === "error" ? "error" : "accent";

  box.setContent({
    title: titleLine,
    lines,
    toolCall: toValueState(toolCallId),
    color,
    elapsedStartedAt: runningCallStart(calls),
  });
  return box;
}

export function hiddenSubagentCall(): Component {
  return EMPTY;
}
