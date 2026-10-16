import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { activityStore } from "../../activity/store.ts";
import { ELAPSED_TIME_LABEL } from "../../constants/tool-rendering/elapsed-label.constant.ts";
import { boxLines } from "../../services/tool-rendering/box/box-lines.service.ts";
import { isActivityVisible } from "../../ui/activity/visibility.ts";
import { requestInspection } from "../../ui/inspector/request.ts";

export class ToolBox implements Component {
  private cached: string[] | undefined;
  private cachedWidth = -1;
  private toolCallId: string | undefined;
  private elapsedStartedAt: number | undefined;

  constructor(
    private theme: Theme,
    private title: string,
    private lines: string[],
    private color: ThemeColor,
    private readonly showElapsed = true,
  ) {}

  setContent(
    title: string,
    lines: string[],
    toolCallId?: string,
    color: ThemeColor = this.color,
    elapsedStartedAt?: number,
  ): void {
    this.title = title;
    this.lines = lines;
    this.toolCallId = toolCallId;
    this.color = color;
    this.elapsedStartedAt = elapsedStartedAt;
    this.cached = undefined;
    this.cachedWidth = -1;
  }

  invalidate(): void {
    this.cached = undefined;
    this.cachedWidth = -1;
  }

  handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
    if (!this.toolCallId || event.type !== "click" || event.button !== "left") return undefined;
    requestInspection(this.toolCallId);
    return { handled: true, focus: true };
  }

  render(width: number): string[] {
    if (!isActivityVisible()) return [];

    const entry = this.toolCallId ? activityStore.get(this.toolCallId) : undefined;
    const running = entry?.status === "running";
    if (this.cached && this.cachedWidth === width && !running) return this.cached;

    const timerStart = this.elapsedStartedAt ?? (running && this.showElapsed ? entry?.startedAt : undefined);
    let lines = this.lines;
    if (timerStart !== undefined) {
      const displayLines = this.lines.filter((line) => !line.includes(ELAPSED_TIME_LABEL));
      const elapsedSeconds = ((Date.now() - timerStart) / 1000).toFixed(1);
      const timeLine = this.theme.fg("muted", `${ELAPSED_TIME_LABEL}${elapsedSeconds} s`);
      lines = [...displayLines, timeLine];
    }

    this.cached = boxLines(width, this.title, lines).map((line) => this.theme.fg(this.color, line));
    this.cachedWidth = width;
    return this.cached;
  }
}
