import { listRow } from "../../../components/split-view/list-row.component.ts";
import type { PromptTheme } from "../../../types/prompts/prompt-theme.interface.ts";
import type { SplitViewGeometry } from "../../../types/split-view/split-view-geometry.interface.ts";

export function renderPromptList(
  summaries: readonly string[],
  selected: number,
  geometry: SplitViewGeometry,
  theme: PromptTheme,
): string[] {
  const listStart = Math.max(0, selected - geometry.listHeight + 1);
  return summaries.slice(listStart, listStart + geometry.listHeight).map((summary, index) => {
    const isSelected = listStart + index === selected;
    return listRow(theme.fg(isSelected ? "accent" : "text", summary), geometry.leftWidth, isSelected, theme);
  });
}
