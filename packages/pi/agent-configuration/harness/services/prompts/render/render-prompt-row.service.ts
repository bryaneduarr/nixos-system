import { THEME_ACCENT, THEME_SELECTED_BACKGROUND } from "../../../constants/prompts/theme.constant.ts";
import type { DisplayRow } from "../../../types/prompts/display/display-row.interface.ts";
import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";
import type { PromptNavigation } from "../../../types/prompts/navigation/prompt-navigation.interface.ts";
import type { TextRange } from "../../../types/prompts/navigation/selection.interface.ts";
import type { PromptTheme } from "../../../types/prompts/render/prompt-theme.interface.ts";

function isUnitInSpan(unit: Grapheme, span: TextRange): boolean {
  return unit.start < span[1] && unit.end > span[0];
}

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
      const selected = selection.found && unit !== undefined && isUnitInSpan(unit, selection.range);
      const cursor = focused && cell.index === navigation.cursor;
      const text = cell.text || (selected || cursor ? " " : "");
      if (selected) return theme.bg(THEME_SELECTED_BACKGROUND, text);
      if (cursor) return theme.bg(THEME_SELECTED_BACKGROUND, theme.fg(THEME_ACCENT, text));
      return text;
    })
    .join("");
}
