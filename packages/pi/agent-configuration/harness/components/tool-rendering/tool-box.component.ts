import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { THEME_MUTED } from "../../constants/split-view/theme-color.constant.ts";
import { ELAPSED_TIME_LABEL } from "../../constants/tool-rendering/details/elapsed-label.constant.ts";
import { readToolActivity } from "../../services/activity/store/read-tool-activity.service.ts";
import { boxLines } from "../../services/tool-rendering/box/box-lines.service.ts";
import { activityVisibility } from "../../stores/activity/activity-visibility.store.ts";
import { inspectRequestStore } from "../../stores/inspector/inspect-request.store.ts";
import type { ToolActivityLookup } from "../../types/activity/store/tool-activity-lookup.interface.ts";
import type { ValueState } from "../../types/activity/value/value-state.interface.ts";
import type { ToolBoxCache } from "../../types/tool-rendering/box/tool-box-cache.interface.ts";
import type { ToolBoxContent } from "../../types/tool-rendering/box/tool-box-content.interface.ts";

export class ToolBox implements Component {
  private content: ToolBoxContent;
  private cache: ToolBoxCache = { state: "stale" };

  constructor(
    private readonly theme: Pick<Theme, "fg">,
    title: string,
    lines: readonly string[],
    color: ThemeColor,
    private readonly showElapsed: boolean,
  ) {
    this.content = {
      title,
      lines,
      toolCall: { state: "absent" },
      color,
      elapsedStartedAt: { state: "absent" },
    };
  }

  setContent(content: ToolBoxContent): void {
    this.content = content;
    this.invalidate();
  }

  invalidate(): void {
    this.cache = { state: "stale" };
  }

  handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
    const toolCall = this.content.toolCall;
    const isLeftClick = event.type === "click" && event.button === "left";
    if (toolCall.state === "absent" || toolCall.value === "" || !isLeftClick) return undefined;
    inspectRequestStore.requestInspection(toolCall.value);
    return { handled: true, focus: true };
  }

  render(width: number): string[] {
    if (!activityVisibility.isVisible()) return [];

    const lookup = readToolActivity(this.content.toolCall);
    const isRunning = lookup.found && lookup.entry.status === "running";
    if (this.cache.state === "rendered" && this.cache.width === width && !isRunning) return [...this.cache.lines];

    const rendered = boxLines(width, this.content.title, this.linesWithElapsed(lookup, isRunning)).map((line) =>
      this.theme.fg(this.content.color, line),
    );
    this.cache = { state: "rendered", width, lines: rendered };
    return rendered;
  }

  private linesWithElapsed(lookup: ToolActivityLookup, isRunning: boolean): readonly string[] {
    const timerStart = this.timerStart(lookup, isRunning);
    if (timerStart.state === "absent") return this.content.lines;

    const displayLines = this.content.lines.filter((line) => !line.includes(ELAPSED_TIME_LABEL));
    const elapsedSeconds = ((Date.now() - timerStart.value) / 1000).toFixed(1);
    const timeLine = this.theme.fg(THEME_MUTED, `${ELAPSED_TIME_LABEL}${elapsedSeconds} s`);
    return [...displayLines, timeLine];
  }

  private timerStart(lookup: ToolActivityLookup, isRunning: boolean): ValueState<number> {
    if (this.content.elapsedStartedAt.state === "present") return this.content.elapsedStartedAt;
    const isTimedRun = isRunning && this.showElapsed && lookup.found;
    return isTimedRun ? { state: "present", value: lookup.entry.startedAt } : { state: "absent" };
  }
}
