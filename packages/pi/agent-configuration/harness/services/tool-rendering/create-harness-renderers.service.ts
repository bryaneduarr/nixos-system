import type { Theme } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import { EMPTY } from "../../components/tool-rendering/empty.component.ts";
import type {
  RendererContext,
  RendererOptions,
  RendererResult,
} from "../../types/tool-rendering/renderer.interface.ts";
import type { HarnessTool } from "../../types/tools/harness-tool.interface.ts";
import { readToolActivity } from "../activity/store/read-tool-activity.service.ts";
import { toValueState } from "../activity/value/to-value-state.service.ts";
import { reuseOrCreateToolBox } from "./box/reuse-tool-box.service.ts";
import { boxTitle } from "./presentation/box-title.service.ts";
import { elapsedLine } from "./presentation/elapsed-line.service.ts";
import { presentationLines } from "./presentation/presentation-lines.service.ts";
import { resultPresentation } from "./presentation/result-presentation.service.ts";
import { resultVisualState } from "./presentation/result-visual-state.service.ts";
import { runningPresentation } from "./presentation/running-presentation.service.ts";
import { toolColor } from "./presentation/tool-color.service.ts";
import { extractText } from "./text/extract-text.service.ts";

function runningBoxTitle(tool: HarnessTool, theme: Theme): string {
  return `${theme.fg("accent", "/")} ${boxTitle(tool, theme)}`;
}

export function createHarnessRenderers(tool: HarnessTool) {
  return {
    renderShell: "self" as const,
    renderCall(args: Record<string, unknown>, theme: Theme, context: RendererContext): Component {
      if (context.isPartial === false) return EMPTY;
      const box = reuseOrCreateToolBox(toValueState(context.lastComponent), theme, toolColor(tool));
      box.setContent({
        title: runningBoxTitle(tool, theme),
        lines: presentationLines(runningPresentation(tool, args), theme),
        toolCall: { state: "present", value: context.toolCallId },
        color: toolColor(tool),
        elapsedStartedAt: { state: "absent" },
      });
      return box;
    },
    renderResult(result: RendererResult, options: RendererOptions, theme: Theme, context: RendererContext): Component {
      const text = extractText(result.content);
      const state = resultVisualState(tool, text, options.isPartial, context.isError);
      const lines = presentationLines(resultPresentation(tool, context.args, text, state), theme);
      const lookup = readToolActivity({ state: "present", value: context.toolCallId });
      if (lookup.found) lines.push(elapsedLine(lookup.entry, theme));

      const box = reuseOrCreateToolBox(toValueState(context.lastComponent), theme, toolColor(tool));
      box.setContent({
        title: state === "running" ? runningBoxTitle(tool, theme) : boxTitle(tool, theme),
        lines,
        toolCall: { state: "present", value: context.toolCallId },
        color: toolColor(tool),
        elapsedStartedAt: { state: "absent" },
      });
      return box;
    },
  };
}
