import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { ELAPSED_TIME_LABEL } from "../constants/tool-rendering/elapsed-label.constant.ts";
import { readToolActivity } from "../services/activity/store/read-tool-activity.service.ts";
import { presentValue } from "../services/activity/value/present-value.service.ts";
import { activityVisibility } from "../services/activity/visibility/shared-activity-visibility.service.ts";
import type { HarnessVisualState } from "../types/tool-rendering/harness-presentation.interface.ts";
import type { RendererContext, RendererOptions, RendererResult } from "../types/tool-rendering/renderer.interface.ts";
import type { HarnessTool } from "../types/tools/harness-tool.interface.ts";
import { boxLines } from "./formatting.ts";
import { requestInspection } from "./inspector/request.ts";
import {
  boxTitle,
  extractText,
  presentationLines,
  resultFailed,
  resultPresentation,
  runningPresentation,
  toolColor,
} from "./tool-presentation.ts";

export {
  extractText,
  presentationLines,
  resultFailed,
  resultPresentation,
  runningPresentation,
  toolColor,
  toolLabel,
  toolTarget,
} from "./tool-presentation.ts";
export { phaseForTool, workingMessageFor } from "./tool-status.ts";

class EmptyComponent implements Component {
  render(): string[] {
    return [];
  }

  invalidate(): void {
    return;
  }
}

export const EMPTY = new EmptyComponent();

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
    if (!activityVisibility.isVisible()) return [];

    const lookup = readToolActivity(this.toolCallId);
    const entry = lookup.found ? lookup.entry : undefined;
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

export function createHarnessRenderers(tool: HarnessTool) {
  return {
    renderShell: "self" as const,
    renderCall(args: Record<string, unknown>, theme: Theme, context: RendererContext): Component {
      if (context.isPartial === false) return EMPTY;
      const box =
        context.lastComponent instanceof ToolBox ? context.lastComponent : new ToolBox(theme, "", [], toolColor(tool));
      const presentation = runningPresentation(tool, args);
      const title = `${theme.fg("accent", "/")} ${boxTitle(tool, theme)}`;
      const lines = presentationLines(presentation, theme);

      box.setContent(title, lines, context.toolCallId, toolColor(tool));
      return box;
    },
    renderResult(result: RendererResult, options: RendererOptions, theme: Theme, context: RendererContext): Component {
      const text = extractText(result.content);
      const state: HarnessVisualState = options.isPartial
        ? "running"
        : context.isError || resultFailed(tool, text)
          ? "error"
          : "success";
      const presentation = resultPresentation(tool, context.args, text, state);
      const lines = presentationLines(presentation, theme);
      const lookup = readToolActivity(context.toolCallId);
      const entry = lookup.found ? lookup.entry : undefined;
      if (entry) {
        const elapsedMs = Math.max(0, (presentValue(entry.endedAt) ?? Date.now()) - entry.startedAt);
        const elapsedLabel = elapsedMs < 1000 ? `${elapsedMs} ms` : `${(elapsedMs / 1000).toFixed(1)} s`;
        lines.push(theme.fg("muted", `${ELAPSED_TIME_LABEL}${elapsedLabel}`));
      }

      const box =
        context.lastComponent instanceof ToolBox ? context.lastComponent : new ToolBox(theme, "", [], toolColor(tool));
      const title = state === "running" ? `${theme.fg("accent", "/")} ${boxTitle(tool, theme)}` : boxTitle(tool, theme);

      box.setContent(title, lines, context.toolCallId, toolColor(tool));
      return box;
    },
  };
}
