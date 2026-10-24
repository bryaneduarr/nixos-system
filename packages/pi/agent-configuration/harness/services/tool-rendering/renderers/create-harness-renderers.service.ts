import type { Theme } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import { EMPTY } from "../../../components/tool-rendering/empty.component.ts";
import { THEME_ACCENT } from "../../../constants/split-view/theme-color.constant.ts";
import { TOOL_COLORS } from "../../../constants/tool-rendering/labels/tool-color.constant.ts";
import type { HarnessRendererResult } from "../../../types/tool-rendering/renderers/harness-renderer-result.interface.ts";
import type { RendererContext } from "../../../types/tool-rendering/renderers/renderer-context.interface.ts";
import type { RendererOptions } from "../../../types/tool-rendering/renderers/renderer-options.interface.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { readToolActivity } from "../../activity/store/read-tool-activity.service.ts";
import { toValueState } from "../../activity/value/to-value-state.service.ts";
import { extractText } from "../../tools/result/extract-text.service.ts";
import { reuseOrCreateToolBox } from "../box/reuse-tool-box.service.ts";
import { elapsedLine } from "../details/elapsed-line.service.ts";
import { boxTitle } from "../labels/box-title.service.ts";
import { presentationLines } from "../presentation/presentation-lines.service.ts";
import { resultPresentation } from "../presentation/result-presentation.service.ts";
import { resultVisualState } from "../presentation/result-visual-state.service.ts";
import { runningPresentation } from "../presentation/running-presentation.service.ts";

function runningBoxTitle(tool: HarnessTool, theme: Theme): string {
  return `${theme.fg(THEME_ACCENT, "/")} ${boxTitle(tool, theme)}`;
}

export function createHarnessRenderers(tool: HarnessTool) {
  return {
    renderShell: "self" as const,
    renderCall(args: Record<string, unknown>, theme: Theme, context: RendererContext): Component {
      if (context.isPartial === false) return EMPTY;
      const box = reuseOrCreateToolBox(toValueState(context.lastComponent), theme, TOOL_COLORS[tool]);
      box.setContent({
        title: runningBoxTitle(tool, theme),
        lines: presentationLines(runningPresentation(tool, args), theme),
        toolCall: { state: "present", value: context.toolCallId },
        color: TOOL_COLORS[tool],
        elapsedStartedAt: { state: "absent" },
      });
      return box;
    },
    renderResult(
      result: HarnessRendererResult,
      options: RendererOptions,
      theme: Theme,
      context: RendererContext,
    ): Component {
      const text = extractText(result.content);
      const state = resultVisualState({ tool, text, isPartial: options.isPartial, isError: context.isError });
      const lines = presentationLines(resultPresentation({ tool, args: context.args, text, state }), theme);
      const lookup = readToolActivity({ state: "present", value: context.toolCallId });
      if (lookup.found) lines.push(elapsedLine(lookup.entry, theme));

      const box = reuseOrCreateToolBox(toValueState(context.lastComponent), theme, TOOL_COLORS[tool]);
      box.setContent({
        title: state === "running" ? runningBoxTitle(tool, theme) : boxTitle(tool, theme),
        lines,
        toolCall: { state: "present", value: context.toolCallId },
        color: TOOL_COLORS[tool],
        elapsedStartedAt: { state: "absent" },
      });
      return box;
    },
  };
}
