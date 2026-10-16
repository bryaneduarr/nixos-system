import { THEME_ACCENT } from "../../../constants/prompts/theme.constant.ts";
import type { PromptFocus } from "../../../types/prompts/prompt-focus.interface.ts";
import type { PromptTheme } from "../../../types/prompts/prompt-theme.interface.ts";

export function renderBrowserHeading(focus: PromptFocus, theme: PromptTheme): string {
  const listLabel = focus === "list" ? "[list]" : "list";
  const detailLabel = focus === "detail" ? "[detail]" : "detail";
  return theme.fg(THEME_ACCENT, `Prompts | ${listLabel} | ${detailLabel}`);
}
