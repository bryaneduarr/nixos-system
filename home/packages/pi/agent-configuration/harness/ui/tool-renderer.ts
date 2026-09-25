import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Component, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { activityStore } from "../activity/store.ts";
import type { HarnessTool } from "../tools/config.ts";
import { isActivityVisible } from "./activity/visibility.ts";
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
  type HarnessVisualState,
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
export type { HarnessPresentation, HarnessVisualState } from "./tool-presentation.ts";
export { phaseForTool, workingMessageFor } from "./tool-status.ts";

export const INSPECT_SHORTCUT = "alt+i";

class EmptyComponent implements Component {
  render(): string[] { return []; }
  invalidate(): void { /* No cached state. */ }
}

const EMPTY = new EmptyComponent();

class ToolBox implements Component {
  private cached: string[] | undefined;
  private cachedWidth = -1;
  private toolCallId: string | undefined;

  constructor(
    private theme: Theme,
    private title: string,
    private lines: string[],
    private color: ThemeColor,
  ) {}

  setContent(
    title: string,
    lines: string[],
    toolCallId?: string,
    color: ThemeColor = this.color,
  ): void {
    this.title = title;
    this.lines = lines;
    this.toolCallId = toolCallId;
    this.color = color;
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
    const elapsed = entry ? Math.max(0, Date.now() - entry.startedAt) : 0;
    const lines = running
      ? [
          ...this.lines.filter((line) => !line.includes("Time: ")),
          this.theme.fg("muted", `Time: ${(elapsed / 1000).toFixed(1)} s`),
        ]
      : this.lines;
    this.cached = boxLines(width, this.title, lines).map((line) => this.theme.fg(this.color, line));
    this.cachedWidth = width;
    return this.cached;
  }
}

interface RendererContextLike {
  args: Record<string, unknown>;
  toolCallId?: string;
  lastComponent: Component | undefined;
  isPartial: boolean;
  isError: boolean;
  expanded: boolean;
}
interface RendererResultLike {
  content: Array<{ type: string; text?: string }>;
  details?: unknown;
}
interface RendererOptionsLike {
  expanded: boolean;
  isPartial: boolean;
}

export function createHarnessRenderers(tool: HarnessTool) {
  return {
    renderShell: "self" as const,
    renderCall(args: Record<string, unknown>, theme: Theme, context: RendererContextLike): Component {
      if (context.isPartial === false) return EMPTY;
      const box = context.lastComponent instanceof ToolBox
        ? context.lastComponent : new ToolBox(theme, "", [], toolColor(tool));
      const presentation = runningPresentation(tool, args);
      box.setContent(
        `${theme.fg("accent", "/")} ${boxTitle(tool, theme)}`,
        presentationLines(presentation, theme),
        context.toolCallId,
        toolColor(tool),
      );
      return box;
    },
    renderResult(
      result: RendererResultLike,
      options: RendererOptionsLike,
      theme: Theme,
      context: RendererContextLike,
    ): Component {
      const text = extractText(result.content);
      const state: HarnessVisualState = options.isPartial
        ? "running"
        : context.isError || resultFailed(tool, text) ? "error" : "success";
      const presentation = resultPresentation(tool, context.args, text, state);
      const lines = presentationLines(presentation, theme);
      const entry = context.toolCallId ? activityStore.get(context.toolCallId) : undefined;
      if (entry) {
        const elapsed = Math.max(0, (entry.endedAt ?? Date.now()) - entry.startedAt);
        lines.push(theme.fg("muted", `Time: ${elapsed < 1000 ? `${elapsed} ms` : `${(elapsed / 1000).toFixed(1)} s`}`));
      }
      const box = context.lastComponent instanceof ToolBox
        ? context.lastComponent : new ToolBox(theme, "", [], toolColor(tool));
      box.setContent(
        state === "running" ? `${theme.fg("accent", "/")} ${boxTitle(tool, theme)}` : boxTitle(tool, theme),
        lines,
        context.toolCallId,
        toolColor(tool),
      );
      return box;
    },
  };
}
