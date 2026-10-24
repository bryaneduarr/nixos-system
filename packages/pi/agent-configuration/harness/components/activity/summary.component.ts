import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { LATEST_ACTIVITY_COLOR } from "../../constants/activity/summary/summary-color.constant.ts";
import { DETAILS_LABEL } from "../../constants/activity/summary/summary-label.constant.ts";
import {
  FOOTER_END_PREFIX,
  FOOTER_PREFIX,
  FOOTER_RESERVED_WIDTH,
  HEADER_PREFIX,
  SUMMARY_SEPARATOR,
  TWO_LINE_HEADER_PREFIX,
} from "../../constants/activity/summary/summary-layout.constant.ts";
import { THEME_ACCENT, THEME_MUTED, THEME_WARNING } from "../../constants/split-view/theme-color.constant.ts";
import { ELLIPSIS } from "../../constants/text/ellipsis.constant.ts";
import { DOT_SEPARATOR } from "../../constants/text/separator.constant.ts";
import { readMessageEntries } from "../../services/activity/messages/read-message-entries.service.ts";
import { readMessageStartedAt } from "../../services/activity/messages/read-message-started-at.service.ts";
import { formatDivider } from "../../services/activity/summary/format-divider.service.ts";
import { formatElapsed } from "../../services/activity/summary/format-elapsed.service.ts";
import { readActionsForMessage } from "../../services/activity/summary/read-actions-for-message.service.ts";
import { readActivityMark } from "../../services/activity/summary/read-activity-mark.service.ts";
import { readJumpToLatestHint } from "../../services/activity/summary/read-jump-to-latest-hint.service.ts";
import { readLatestActivityText } from "../../services/activity/summary/read-latest-activity-text.service.ts";
import { readSpinnerFrame } from "../../services/activity/summary/read-spinner-frame.service.ts";
import { wrapFooterParts } from "../../services/activity/summary/wrap-footer-parts.service.ts";
import { harnessToolTarget } from "../../services/tool-rendering/labels/harness-tool-target.service.ts";
import { toolLabel } from "../../services/tool-rendering/labels/tool-label.service.ts";
import { isHarnessTool } from "../../services/tools/active-tools/is-harness-tool.service.ts";
import { activitySummaryState } from "../../stores/activity/activity-summary-state.store.ts";
import { activityVisibility } from "../../stores/activity/activity-visibility.store.ts";
import type { ToolActivity } from "../../types/activity/store/tool-activity.interface.ts";
import type { ActivitySummaryTarget } from "../../types/activity/summary/activity-summary-target.interface.ts";
import type { SummaryHeaderParts } from "../../types/activity/summary/summary-header-parts.interface.ts";
import type { TranscriptScroll } from "../../types/activity/summary/transcript-scroll.interface.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";

class ActivitySummaryComponent implements Component {
  constructor(
    private readonly target: ActivitySummaryTarget,
    private readonly theme: Pick<SplitViewTheme, "fg">,
    private readonly scroll: TranscriptScroll,
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
    const summaryParts = [countLabel, ...(duration ? [duration] : []), DETAILS_LABEL];
    const trailing = summaryParts.join(SUMMARY_SEPARATOR);
    const latestText = readLatestActivityText(this.target.messageNumber, entries, working);
    const activity = `${readActivityMark({ working, expanded, runningCount: runningTools.length, frame })} ${latestText}`;
    const toolLines = expanded && working ? this.runningToolLines(runningTools, frame, width) : [];
    const isAwayFromLatest = this.scroll.isAwayFromLatest();
    const twoLines =
      isAwayFromLatest ||
      toolLines.length > 0 ||
      singleLineTitleWidth(width, leading, trailing) < visibleWidth(activity);
    const header = this.header({ width, leading, trailing, activity, twoLines });
    const footerParts = isAwayFromLatest ? [...summaryParts, this.jumpToLatestHint()] : summaryParts;
    const footer = twoLines ? this.footer(footerParts, width) : [];
    return [header, ...toolLines, ...footer];
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
    const { width, leading, trailing, activity, twoLines } = parts;
    const titleWidth = Math.max(
      0,
      twoLines
        ? width - visibleWidth(`${TWO_LINE_HEADER_PREFIX}${leading}${SUMMARY_SEPARATOR}`) - 1
        : singleLineTitleWidth(width, leading, trailing),
    );
    const title =
      titleWidth > 0
        ? `${SUMMARY_SEPARATOR}${this.theme.fg(LATEST_ACTIVITY_COLOR, truncateToWidth(activity, titleWidth, ELLIPSIS, true))}`
        : "";
    const trailingText = twoLines ? "" : this.theme.fg(THEME_MUTED, `${SUMMARY_SEPARATOR}${trailing}`);
    const label = `${this.theme.fg(THEME_MUTED, leading)}${title}${trailingText}`;
    return formatDivider({
      theme: this.theme,
      label,
      width,
      prefix: twoLines ? TWO_LINE_HEADER_PREFIX : HEADER_PREFIX,
    });
  }

  private jumpToLatestHint(): string {
    return this.theme.fg(THEME_WARNING, readJumpToLatestHint());
  }

  private footer(parts: readonly string[], width: number): string[] {
    const lines = wrapFooterParts(parts, Math.max(1, width - FOOTER_RESERVED_WIDTH));
    return lines.map((text, index) =>
      formatDivider({
        theme: this.theme,
        label: this.theme.fg(THEME_MUTED, text),
        width,
        prefix: index === lines.length - 1 ? FOOTER_END_PREFIX : FOOTER_PREFIX,
      }),
    );
  }

  private runningToolLines(runningTools: readonly ToolActivity[], frame: number, width: number): string[] {
    const labelWidth = Math.max(1, width - FOOTER_RESERVED_WIDTH);
    return runningTools.map((tool) => {
      const target = isHarnessTool(tool.toolName) ? harnessToolTarget(tool.toolName, tool.args) : "";
      const targetSuffix = target ? `${DOT_SEPARATOR}${target}` : "";
      const label = `${readSpinnerFrame(frame)} ${toolLabel(tool.toolName)}${targetSuffix}`;
      const coloredLabel = this.theme.fg(THEME_ACCENT, truncateToWidth(label, labelWidth, ELLIPSIS, true));
      return formatDivider({ theme: this.theme, label: coloredLabel, width, prefix: FOOTER_PREFIX });
    });
  }
}

function singleLineTitleWidth(width: number, leading: string, trailing: string): number {
  return width - visibleWidth(`${HEADER_PREFIX}${leading} |  | ${trailing} `) - 1;
}

export function renderActivitySummary(
  target: ActivitySummaryTarget,
  theme: Pick<SplitViewTheme, "fg">,
  scroll: TranscriptScroll,
): Component {
  return new ActivitySummaryComponent(target, theme, scroll);
}
