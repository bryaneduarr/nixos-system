import { HORIZONTAL_BORDER, VERTICAL_BORDER } from "../../../constants/prompts/layout.constant.ts";
import { THEME_BORDER_MUTED } from "../../../constants/prompts/theme.constant.ts";
import type { BrowserLayout } from "../../../types/prompts/browser-layout.interface.ts";
import type { PromptTheme } from "../../../types/prompts/prompt-theme.interface.ts";
import { fitLine } from "./fit-line.service.ts";

function paddedLines(lines: readonly string[], count: number): string[] {
  return Array.from({ length: count }, (_, index) => lines[index] ?? "");
}

export function joinBrowserPanes(
  layout: BrowserLayout,
  list: readonly string[],
  detail: readonly string[],
  theme: PromptTheme,
): string[] {
  if (layout.stacked) {
    return [
      ...paddedLines(list, layout.listHeight),
      theme.fg(THEME_BORDER_MUTED, HORIZONTAL_BORDER.repeat(layout.inner)),
      ...paddedLines(detail, layout.pageSize),
    ];
  }
  const divider = theme.fg(THEME_BORDER_MUTED, VERTICAL_BORDER);
  return paddedLines(list, layout.body).map(
    (listLine, index) => `${fitLine(listLine, layout.listWidth)} ${divider} ${detail[index] ?? ""}`,
  );
}
