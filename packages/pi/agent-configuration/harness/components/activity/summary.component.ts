import type { Theme } from "@earendil-works/pi-coding-agent";
import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { MESSAGE_ACTIVITY_NAME, UPDATE_ACTIVITY_NAME } from "../../constants/activity/activity-entry.constant.ts";
import { SPINNER_FRAMES } from "../../constants/activity/spinner.constant.ts";
import { readMessageEntries } from "../../services/activity/history/read-message-entries.service.ts";
import { activityStore } from "../../services/activity/store/shared-activity-store.service.ts";
import { readActionsForMessage } from "../../services/activity/summary/actions-for-message.service.ts";
import { formatElapsed } from "../../services/activity/summary/format-elapsed.service.ts";
import { activitySummaryState } from "../../services/activity/summary/shared-activity-summary-state.service.ts";
import { readThinkingTitles } from "../../services/activity/summary/thinking-titles.service.ts";
import { presentValue } from "../../services/activity/value/present-value.service.ts";
import { activityVisibility } from "../../services/activity/visibility/shared-activity-visibility.service.ts";
import { isHarnessTool } from "../../tools/config.ts";
import type { ActivitySummaryData } from "../../types/activity/activity-summary.interface.ts";
import type { SummaryHeaderParts } from "../../types/activity/summary-header-parts.interface.ts";
import type { ToolActivity } from "../../types/activity/tool-activity.interface.ts";
import { oneLine } from "../../ui/formatting.ts";
import { toolLabel, toolTarget } from "../../ui/tool-presentation.ts";

const DETAILS_LABEL = "Alt+I details";

class ActivitySummaryComponent implements Component {
  constructor(
    private readonly data: ActivitySummaryData,
    private readonly theme: Theme,
  ) {}

  render(width: number): string[] {
    const working = activitySummaryState.isWorking();
    const frame = activitySummaryState.currentFrame();
    const expanded = activityVisibility.isVisible();
    const current = readMessageEntries(this.data.messageNumber);
    const runningTools = current.filter((entry) => isHarnessTool(entry.toolName) && entry.status === "running");
    const count = readActionsForMessage(this.data.messageNumber).length;
    const leading = `Alt+V ${expanded ? "hide" : "show"}`;
    const countLabel = `${count} ${count === 1 ? "action" : "actions"}`;
    const duration = this.duration();
    const trailing = `${countLabel}${duration ? ` | ${duration}` : ""} | ${DETAILS_LABEL}`;
    const activity = `${markFor(working, expanded, runningTools.length, frame)} ${this.latestText(current, working)}`;
    const singleLineTitleWidth = width - visibleWidth(`- ${leading} |  | ${trailing} `) - 1;
    const twoLines = singleLineTitleWidth < visibleWidth(activity);
    const header = this.header({ width, leading, trailing, activity, working, twoLines });
    const footer = twoLines ? this.footer(countLabel, duration, width) : [];
    if (!expanded) return [header, ...footer];
    return [header, ...footer, ...this.expandedLines(current, runningTools, working, frame, width)];
  }

  handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
    if (event.type !== "click" || event.button !== "left" || event.y !== 0) {
      return undefined;
    }
    activityVisibility.toggle();
    return { handled: true, render: true };
  }

  invalidate(): void {}

  private duration(): string {
    const startedAt = activityStore
      .all()
      .find(
        (entry) => entry.toolName === MESSAGE_ACTIVITY_NAME && entry.args.number === this.data.messageNumber,
      )?.startedAt;
    if (startedAt === undefined) return "";
    const endedAt = presentValue(activitySummaryState.completion(this.data.messageNumber)) ?? Date.now();
    return formatElapsed(endedAt - startedAt);
  }

  private latestText(current: readonly ToolActivity[], working: boolean): string {
    const lastTool = current.filter((entry) => isHarnessTool(entry.toolName)).at(-1);
    const toolTitle =
      lastTool && isHarnessTool(lastTool.toolName)
        ? `${toolLabel(lastTool.toolName)} ${toolTarget(lastTool.toolName, lastTool.args)}`
        : "";
    const latest =
      readThinkingTitles(this.data.messageNumber).at(-1) ||
      oneLine(current.filter((entry) => entry.toolName === UPDATE_ACTIVITY_NAME).at(-1)?.text ?? "") ||
      toolTitle;
    return latest || (working ? "Working" : "Completed");
  }

  private header(parts: SummaryHeaderParts): string {
    const { width, leading, trailing, activity, working, twoLines } = parts;
    const singleLineTitleWidth = width - visibleWidth(`- ${leading} |  | ${trailing} `) - 1;
    const titleWidth = Math.max(0, twoLines ? width - visibleWidth(`┌ ${leading} | `) - 1 : singleLineTitleWidth);
    const title =
      titleWidth > 0
        ? ` | ${this.theme.fg(working ? "accent" : "muted", truncateToWidth(activity, titleWidth, "...", true))}`
        : "";
    const trailingText = twoLines ? "" : this.theme.fg("muted", ` | ${trailing}`);
    return this.divider(`${this.theme.fg("muted", leading)}${title}${trailingText}`, width, twoLines ? "┌ " : "- ");
  }

  private footer(countLabel: string, duration: string, width: number): string[] {
    const parts = [countLabel, ...(duration ? [duration] : []), DETAILS_LABEL];
    const available = Math.max(1, width - 3);
    const lines: string[] = [];
    let line = "";
    for (const part of parts) {
      const candidate = line ? `${line} | ${part}` : part;
      if (line && visibleWidth(candidate) > available) {
        lines.push(line);
        line = part;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
    return lines.map((text, index) =>
      this.divider(this.theme.fg("muted", text), width, index === lines.length - 1 ? "└ " : "│ "),
    );
  }

  private expandedLines(
    current: readonly ToolActivity[],
    runningTools: readonly ToolActivity[],
    working: boolean,
    frame: number,
    width: number,
  ): string[] {
    const updates = current.filter((entry) => entry.toolName === UPDATE_ACTIVITY_NAME && entry.text.trim());
    const updateLines = updates.flatMap((entry) =>
      entry.text
        .trim()
        .split("\n")
        .map((line) => this.theme.fg("muted", truncateToWidth(`  ${oneLine(line)}`, width, "...", true))),
    );
    const toolLines = (working ? runningTools : []).map((tool) => {
      const target = isHarnessTool(tool.toolName) ? toolTarget(tool.toolName, tool.args) : "";
      const spinner = spinnerFrameAt(frame);
      return this.theme.fg(
        "accent",
        truncateToWidth(`  ${spinner} ${toolLabel(tool.toolName)}${target ? ` · ${target}` : ""}`, width, "...", true),
      );
    });
    return [...updateLines, ...toolLines];
  }

  private divider(label: string, width: number, prefix = "- "): string {
    if (width < 4) {
      return truncateToWidth("-", Math.max(1, width), "", true);
    }
    const suffix = " ";
    const labelWidth = Math.max(1, width - visibleWidth(prefix) - 1);
    const clippedLabel = truncateToWidth(label, labelWidth, "", true);
    const remaining = Math.max(0, width - visibleWidth(prefix) - visibleWidth(clippedLabel) - visibleWidth(suffix));
    return `${this.theme.fg("muted", prefix)}${clippedLabel}${this.theme.fg("muted", `${suffix}${"-".repeat(remaining)}`)}`;
  }
}

function spinnerFrameAt(frame: number): string {
  return SPINNER_FRAMES[frame % SPINNER_FRAMES.length] ?? "";
}

function markFor(working: boolean, expanded: boolean, runningCount: number, frame: number): string {
  if (!working) return "done";
  if (runningCount > 0 && expanded) return "·";
  return spinnerFrameAt(frame);
}

export function renderActivitySummary(data: ActivitySummaryData, theme: Theme): Component {
  return new ActivitySummaryComponent(data, theme);
}
