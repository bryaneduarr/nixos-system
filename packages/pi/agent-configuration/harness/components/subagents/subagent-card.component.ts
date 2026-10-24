import type { Component } from "@earendil-works/pi-tui";
import { THEME_ACCENT, THEME_TEXT } from "../../constants/split-view/theme-color.constant.ts";
import { CARD_BOX_TITLE } from "../../constants/subagents/card/card.constant.ts";
import { readToolActivity } from "../../services/activity/store/read-tool-activity.service.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { readRunningCallStart } from "../../services/subagents/card/read-running-call-start.service.ts";
import { renderCallLines } from "../../services/subagents/card/render-call-lines.service.ts";
import { renderFinalStatusLine } from "../../services/subagents/card/render-final-status-line.service.ts";
import { renderIdleLines } from "../../services/subagents/card/render-idle-lines.service.ts";
import { resolveCardCalls } from "../../services/subagents/card/resolve-card-calls.service.ts";
import { resolveCardProgress } from "../../services/subagents/card/resolve-card-progress.service.ts";
import { resolveCardStatus } from "../../services/subagents/card/resolve-card-status.service.ts";
import { resolveCardTitle } from "../../services/subagents/card/resolve-card-title.service.ts";
import { oneLine } from "../../services/tool-rendering/text/one-line.service.ts";
import type { ValueState } from "../../types/activity/value/value-state.interface.ts";
import type { RenderSubagentCardInput } from "../../types/subagents/card/render-subagent-card-input.interface.ts";
import type { SubagentCardTheme } from "../../types/subagents/card/subagent-card-theme.interface.ts";
import { ToolBox } from "../tool-rendering/tool-box.component.ts";

function reusableBox(theme: SubagentCardTheme, lastComponent: ValueState<Component>): ToolBox {
  if (lastComponent.state === "present" && lastComponent.value instanceof ToolBox) return lastComponent.value;

  return new ToolBox(theme, "", [], THEME_ACCENT, false);
}

export function renderSubagentCard(input: RenderSubagentCardInput): Component {
  const { theme, toolCallId, title, progressLookup, lastComponent } = input;
  const activityLookup = readToolActivity({ state: "present", value: toolCallId });
  const current = resolveCardProgress(progressLookup, activityLookup);
  const status = resolveCardStatus(current, activityLookup);
  const label = resolveCardTitle(current, title, activityLookup);
  const calls = resolveCardCalls(progressLookup, activityLookup);
  const call = calls.findLast((toolCall) => toolCall.status === "running") ?? calls.at(-1);
  const activity = call ? renderCallLines(theme, call, status) : renderIdleLines(theme, status);
  const lines = [theme.fg(THEME_TEXT, oneLine(label)), ...activity];

  if (status !== "running") {
    lines.push(renderFinalStatusLine(theme, status));
  }

  const box = reusableBox(theme, lastComponent);
  const boxTitle = theme.fg("toolTitle", theme.bold(CARD_BOX_TITLE));
  const titleLine = status === "running" ? `${theme.fg(THEME_ACCENT, "/")} ${boxTitle}` : boxTitle;
  const color = status === "error" ? "error" : THEME_ACCENT;

  box.setContent({
    title: titleLine,
    lines,
    toolCall: toValueState(toolCallId),
    color,
    elapsedStartedAt: readRunningCallStart(calls),
  });
  return box;
}
