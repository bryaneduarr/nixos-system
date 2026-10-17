import { THEME_ACCENT, THEME_MUTED } from "../../../constants/prompts/theme.constant.ts";
import { ACTIVE_LIST_MARKER, INACTIVE_LIST_MARKER } from "../../../constants/prompts/viewer.constant.ts";
import type { BrowserLayout } from "../../../types/prompts/browser-layout.interface.ts";
import type { PromptTheme } from "../../../types/prompts/prompt-theme.interface.ts";
import { fitLine } from "./fit-line.service.ts";

export function renderPromptList(
  summaries: readonly string[],
  selected: number,
  layout: BrowserLayout,
  theme: PromptTheme,
): string[] {
  const listStart = Math.max(0, selected - layout.listHeight + 1);
  return summaries.slice(listStart, listStart + layout.listHeight).map((summary, index) => {
    const active = listStart + index === selected;
    const marker = active ? ACTIVE_LIST_MARKER : INACTIVE_LIST_MARKER;
    return theme.fg(active ? THEME_ACCENT : THEME_MUTED, fitLine(`${marker} ${summary}`, layout.listWidth));
  });
}
