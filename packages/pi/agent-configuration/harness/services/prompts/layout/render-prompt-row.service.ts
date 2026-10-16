import { THEME_ACCENT, THEME_SELECTED_BACKGROUND } from "../../../constants/prompts/theme.constant.ts";
import type { DisplayRow } from "../../../types/prompts/display-row.interface.ts";
import type { PromptNavigation } from "../../../types/prompts/prompt-navigation.interface.ts";
import type { PromptTheme } from "../../../types/prompts/prompt-theme.interface.ts";

export function renderPromptRow(
  row: DisplayRow,
  navigation: PromptNavigation,
  focused: boolean,
  theme: PromptTheme,
): string {
  const selection = navigation.range();
  return row
    .map((cell) => {
      const unit = navigation.units[cell.index];
      const selected =
        selection.found && unit !== undefined && unit.start < selection.range[1] && unit.end > selection.range[0];
      const cursor = focused && cell.index === navigation.cursor;
      const text = cell.text || (selected || cursor ? " " : "");
      if (selected) return theme.bg(THEME_SELECTED_BACKGROUND, text);
      if (cursor) return theme.bg(THEME_SELECTED_BACKGROUND, theme.fg(THEME_ACCENT, text));
      return text;
    })
    .join("");
}
