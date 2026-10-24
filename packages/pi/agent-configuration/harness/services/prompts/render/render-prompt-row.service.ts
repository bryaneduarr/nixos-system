import { SELECTED_ROW_BACKGROUND, THEME_ACCENT } from "../../../constants/split-view/theme-color.constant.ts";
import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";
import type { TextRange } from "../../../types/prompts/navigation/selection.interface.ts";
import type { PromptRowOptions } from "../../../types/prompts/render/prompt-row-options.interface.ts";

function isUnitInSpan(unit: Grapheme, span: TextRange): boolean {
  return unit.start < span[1] && unit.end > span[0];
}

export function renderPromptRow({ row, navigation, focused, theme }: PromptRowOptions): string {
  const selection = navigation.range();
  return row
    .map((cell) => {
      const unit = navigation.units[cell.index];
      const selected = selection.found && unit !== undefined && isUnitInSpan(unit, selection.range);
      const cursor = focused && cell.index === navigation.cursor;
      const text = cell.text || (selected || cursor ? " " : "");
      if (selected) return theme.bg(SELECTED_ROW_BACKGROUND, text);
      if (cursor) return theme.bg(SELECTED_ROW_BACKGROUND, theme.fg(THEME_ACCENT, text));
      return text;
    })
    .join("");
}
