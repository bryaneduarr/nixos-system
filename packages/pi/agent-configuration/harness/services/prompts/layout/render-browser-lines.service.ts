import { THEME_MUTED } from "../../../constants/prompts/theme.constant.ts";
import { PROMPT_BROWSER_FOOTER_HINT } from "../../../constants/prompts/viewer.constant.ts";
import type { BrowserRenderInput } from "../../../types/prompts/browser-render-input.interface.ts";
import { frameLines } from "./frame-lines.service.ts";
import { joinBrowserPanes } from "./join-browser-panes.service.ts";
import { renderBrowserHeading } from "./render-browser-heading.service.ts";
import { renderPromptList } from "./render-prompt-list.service.ts";
import { renderPromptRow } from "./render-prompt-row.service.ts";

export function renderBrowserLines(input: BrowserRenderInput): string[] {
  const list = renderPromptList(input.summaries, input.selected, input.layout, input.theme);
  const detail = input.rows
    .slice(input.offset, input.offset + input.layout.pageSize)
    .map((row) => renderPromptRow(row, input.navigation, input.focus === "detail", input.theme));
  const footer = input.theme.fg(THEME_MUTED, input.status || PROMPT_BROWSER_FOOTER_HINT);
  const lines = [
    renderBrowserHeading(input.focus, input.theme),
    ...joinBrowserPanes(input.layout, list, detail, input.theme),
    footer,
  ];
  return frameLines(lines, input.columns, input.theme).slice(0, input.layout.height);
}
