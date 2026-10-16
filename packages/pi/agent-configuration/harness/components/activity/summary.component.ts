import type { Theme } from "@earendil-works/pi-coding-agent";
import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { UPDATE_ACTIVITY_NAME } from "../../constants/activity/activity-entry.constant.ts";
import {
  ACCENT_COLOR,
  DETAILS_LABEL,
  ELLIPSIS,
  EXPANDED_LINE_INDENT,
  MUTED_COLOR,
  SUMMARY_SEPARATOR,
  TOOL_TARGET_SEPARATOR,
} from "../../constants/activity/summary-label.constant.ts";
import {
  FOOTER_END_PREFIX,
  FOOTER_PREFIX,
  FOOTER_RESERVED_WIDTH,
  HEADER_PREFIX,
  TWO_LINE_HEADER_PREFIX,
} from "../../constants/activity/summary-layout.constant.ts";
import { readMessageEntries } from "../../services/activity/history/read-message-entries.service.ts";
import { readMessageStartedAt } from "../../services/activity/history/read-message-started-at.service.ts";
import { readActionsForMessage } from "../../services/activity/summary/actions-for-message.service.ts";
import { formatDivider } from "../../services/activity/summary/format-divider.service.ts";
import { formatElapsed } from "../../services/activity/summary/format-elapsed.service.ts";
import { readActivityMark } from "../../services/activity/summary/read-activity-mark.service.ts";
import { readLatestActivityText } from "../../services/activity/summary/read-latest-activity-text.service.ts";
import { readSpinnerFrame } from "../../services/activity/summary/read-spinner-frame.service.ts";
import { activitySummaryState } from "../../services/activity/summary/shared-activity-summary-state.service.ts";
import { wrapFooterParts } from "../../services/activity/summary/wrap-footer-parts.service.ts";
import { activityVisibility } from "../../services/activity/visibility/shared-activity-visibility.service.ts";
import { toolLabel } from "../../services/tool-rendering/presentation/tool-label.service.ts";
import { toolTarget } from "../../services/tool-rendering/presentation/tool-target.service.ts";
import { oneLine } from "../../services/tool-rendering/text/one-line.service.ts";
import { isHarnessTool } from "../../services/tools/is-harness-tool.service.ts";
import type { ActivitySummaryTarget } from "../../types/activity/activity-summary-target.interface.ts";
import type { SummaryHeaderParts } from "../../types/activity/summary-header-parts.interface.ts";
import type { ToolActivity } from "../../types/activity/tool-activity.interface.ts";

class ActivitySummaryComponent implements Component {
  constructor(
    private readonly target: ActivitySummaryTarget,
    private readonly theme: Theme,
  ) {}

  render(width: number): string[] {
    const working = activitySummaryState.isWorking();
    const frame = activitySummaryState.currentFrame();
    const expanded = activityVisibility.isVisible();
    const entries = readMessageEntries(this.target.messageNumber);
    const runningTools = entries.filter((entry) => isHarnessTool(entry.toolName) && entry.status === "running");
    const actionCount = readActionsForMessage(this.target.messageNumber).length;
    const leading = `Alt+V ${expanded ? "hide" : "show"}`;
    const countLabel = `${actionCount} ${actionCount === 1 ? "action" : "actions"}`;
    const duration = this.duration();
    const trailing = [countLabel, ...(duration ? [duration] : []), DETAILS_LABEL].join(SUMMARY_SEPARATOR);
    const latestText = readLatestActivityText(this.target.messageNumber, entries, working);
    const activity = `${readActivityMark(working, expanded, runningTools.length, frame)} ${latestText}`;
    const twoLines = singleLineTitleWidth(width, leading, trailing) < visibleWidth(activity);
    const header = this.header({ width, leading, trailing, activity, working, twoLines });
    const footer = twoLines ? this.footer(countLabel, duration, width) : [];
    if (!expanded) return [header, ...footer];
    return [header, ...footer, ...this.expandedLines(entries, runningTools, working, frame, width)];
  }

  handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
    const isLeftClick = event.type === "click" && event.button === "left";
    const isHeaderRow = event.y === 0;
    if (!isLeftClick || !isHeaderRow) return undefined;
    activityVisibility.toggle();
    return { handled: true, render: true };
  }

  invalidate(): void {}

  private duration(): string {
    const startedAt = readMessageStartedAt(this.target.messageNumber);
    if (startedAt.state === "absent") return "";
    const completion = activitySummaryState.completion(this.target.messageNumber);
    const endedAt = completion.state === "present" ? completion.value : Date.now();
    return formatElapsed(endedAt - startedAt.value);
  }

  private header(parts: SummaryHeaderParts): string {
    const { width, leading, trailing, activity, working, twoLines } = parts;
    const titleWidth = Math.max(
      0,
      twoLines
        ? width - visibleWidth(`${TWO_LINE_HEADER_PREFIX}${leading}${SUMMARY_SEPARATOR}`) - 1
        : singleLineTitleWidth(width, leading, trailing),
    );
    const activityColor = working ? ACCENT_COLOR : MUTED_COLOR;
    const title =
      titleWidth > 0
        ? `${SUMMARY_SEPARATOR}${this.theme.fg(activityColor, truncateToWidth(activity, titleWidth, ELLIPSIS, true))}`
        : "";
    const trailingText = twoLines ? "" : this.theme.fg(MUTED_COLOR, `${SUMMARY_SEPARATOR}${trailing}`);
    const label = `${this.theme.fg(MUTED_COLOR, leading)}${title}${trailingText}`;
    return formatDivider(this.theme, label, width, twoLines ? TWO_LINE_HEADER_PREFIX : HEADER_PREFIX);
  }

  private footer(countLabel: string, duration: string, width: number): string[] {
    const parts = [countLabel, ...(duration ? [duration] : []), DETAILS_LABEL];
    const lines = wrapFooterParts(parts, Math.max(1, width - FOOTER_RESERVED_WIDTH));
    return lines.map((text, index) =>
      formatDivider(
        this.theme,
        this.theme.fg(MUTED_COLOR, text),
        width,
        index === lines.length - 1 ? FOOTER_END_PREFIX : FOOTER_PREFIX,
      ),
    );
  }

  private expandedLines(
    entries: readonly ToolActivity[],
    runningTools: readonly ToolActivity[],
    working: boolean,
    frame: number,
    width: number,
  ): string[] {
    const updates = entries.filter((entry) => entry.toolName === UPDATE_ACTIVITY_NAME && entry.text.trim());
    const updateLines = updates.flatMap((entry) =>
      entry.text
        .trim()
        .split("\n")
        .map((line) =>
          this.theme.fg(MUTED_COLOR, truncateToWidth(`${EXPANDED_LINE_INDENT}${oneLine(line)}`, width, ELLIPSIS, true)),
        ),
    );
    const toolLines = (working ? runningTools : []).map((tool) => {
      const target = isHarnessTool(tool.toolName) ? toolTarget(tool.toolName, tool.args) : "";
      const targetSuffix = target ? `${TOOL_TARGET_SEPARATOR}${target}` : "";
      const line = `${EXPANDED_LINE_INDENT}${readSpinnerFrame(frame)} ${toolLabel(tool.toolName)}${targetSuffix}`;
      return this.theme.fg(ACCENT_COLOR, truncateToWidth(line, width, ELLIPSIS, true));
    });
    return [...updateLines, ...toolLines];
  }
}

function singleLineTitleWidth(width: number, leading: string, trailing: string): number {
  return width - visibleWidth(`${HEADER_PREFIX}${leading} |  | ${trailing} `) - 1;
}

export function renderActivitySummary(target: ActivitySummaryTarget, theme: Theme): Component {
  return new ActivitySummaryComponent(target, theme);
}
