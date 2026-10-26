import type { Theme, ToolRenderers } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import { EMPTY } from "../../../../components/tool-rendering/empty.component.ts";
import { THEME_ACCENT } from "../../../../constants/split-view/theme-color.constant.ts";
import { CODEMODE_BOX_TITLE } from "../../../../constants/tools/active-tools/codemode.constant.ts";
import { readToolActivity } from "../../../activity/store/read-tool-activity.service.ts";
import { toValueState } from "../../../activity/value/to-value-state.service.ts";
import { extractText } from "../../../tools/result/extract-text.service.ts";
import { reuseOrCreateToolBox } from "../../box/reuse-tool-box.service.ts";
import { elapsedLine } from "../../details/elapsed-line.service.ts";
import { presentationLines } from "../../presentation/presentation-lines.service.ts";
import { codemodePresentation } from "../presentation/codemode-presentation.service.ts";
import { codemodeVisualState } from "../presentation/codemode-visual-state.service.ts";
import { readCodemodeCalls } from "../script/read-codemode-calls.service.ts";
import { readScriptCode } from "../script/read-script-code.service.ts";

function titleFor(theme: Theme, isRunning: boolean): string {
  const title = theme.fg("toolTitle", theme.bold(CODEMODE_BOX_TITLE));
  return isRunning ? `${theme.fg(THEME_ACCENT, "/")} ${title}` : title;
}

export function createCodemodeRenderers(): ToolRenderers {
  return {
    renderShell: "self",
    renderCall(args, theme, context): Component {
      if (context.isPartial === false) return EMPTY;
      const presentation = codemodePresentation({ code: readScriptCode(args), calls: [], text: "", state: "running" });
      const box = reuseOrCreateToolBox(toValueState(context.lastComponent), theme, THEME_ACCENT);
      box.setContent({
        title: titleFor(theme, true),
        lines: presentationLines(presentation, theme),
        toolCall: { state: "present", value: context.toolCallId },
        color: THEME_ACCENT,
        elapsedStartedAt: { state: "absent" },
      });
      return box;
    },
    renderResult(result, options, theme, context): Component {
      const text = extractText(result.content);
      const state = codemodeVisualState(text, options.isPartial, context.isError);
      const calls = readCodemodeCalls(result.details);
      const lines = presentationLines(
        codemodePresentation({ code: readScriptCode(context.args), calls, text, state }),
        theme,
      );
      const lookup = readToolActivity({ state: "present", value: context.toolCallId });
      if (lookup.found) lines.push(elapsedLine(lookup.entry, theme));

      const box = reuseOrCreateToolBox(toValueState(context.lastComponent), theme, THEME_ACCENT);
      box.setContent({
        title: titleFor(theme, state === "running"),
        lines,
        toolCall: { state: "present", value: context.toolCallId },
        color: THEME_ACCENT,
        elapsedStartedAt: { state: "absent" },
      });
      return box;
    },
  };
}
