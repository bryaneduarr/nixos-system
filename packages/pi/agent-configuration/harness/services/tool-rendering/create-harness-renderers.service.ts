import type { Theme } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import { activityStore } from "../../activity/store.ts";
import { EMPTY } from "../../components/tool-rendering/empty.component.ts";
import { ToolBox } from "../../components/tool-rendering/tool-box.component.ts";
import type {
  RendererContext,
  RendererOptions,
  RendererResult,
} from "../../types/tool-rendering/renderer.interface.ts";
import type { HarnessTool } from "../../types/tools/harness-tool.interface.ts";
import { boxTitle } from "./presentation/box-title.service.ts";
import { elapsedLine } from "./presentation/elapsed-line.service.ts";
import { presentationLines } from "./presentation/presentation-lines.service.ts";
import { resultPresentation } from "./presentation/result-presentation.service.ts";
import { resultVisualState } from "./presentation/result-visual-state.service.ts";
import { runningPresentation } from "./presentation/running-presentation.service.ts";
import { toolColor } from "./presentation/tool-color.service.ts";
import { extractText } from "./text/extract-text.service.ts";

function reuseOrCreateToolBox(context: RendererContext, theme: Theme, tool: HarnessTool): ToolBox {
  return context.lastComponent instanceof ToolBox ? context.lastComponent : new ToolBox(theme, "", [], toolColor(tool));
}

export function createHarnessRenderers(tool: HarnessTool) {
  return {
    renderShell: "self" as const,
    renderCall(args: Record<string, unknown>, theme: Theme, context: RendererContext): Component {
      if (context.isPartial === false) return EMPTY;
      const box = reuseOrCreateToolBox(context, theme, tool);
      const title = `${theme.fg("accent", "/")} ${boxTitle(tool, theme)}`;
      const lines = presentationLines(runningPresentation(tool, args), theme);

      box.setContent(title, lines, context.toolCallId, toolColor(tool));
      return box;
    },
    renderResult(result: RendererResult, options: RendererOptions, theme: Theme, context: RendererContext): Component {
      const text = extractText(result.content);
      const state = resultVisualState(tool, text, options.isPartial, context.isError);
      const lines = presentationLines(resultPresentation(tool, context.args, text, state), theme);
      const entry = context.toolCallId ? activityStore.get(context.toolCallId) : undefined;
      if (entry) lines.push(elapsedLine(entry, theme));

      const box = reuseOrCreateToolBox(context, theme, tool);
      const title = state === "running" ? `${theme.fg("accent", "/")} ${boxTitle(tool, theme)}` : boxTitle(tool, theme);

      box.setContent(title, lines, context.toolCallId, toolColor(tool));
      return box;
    },
  };
}
