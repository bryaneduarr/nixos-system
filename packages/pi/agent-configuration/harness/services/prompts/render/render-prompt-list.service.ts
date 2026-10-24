import { listRow } from "../../../components/split-view/list-row.component.ts";
import { THEME_ACCENT, THEME_TEXT } from "../../../constants/split-view/theme-color.constant.ts";
import type { PromptListOptions } from "../../../types/prompts/render/prompt-list-options.interface.ts";
import { computeListScroll } from "../../split-view/layout/compute-list-scroll.service.ts";

export function renderPromptList({ summaries, selected, geometry, theme }: PromptListOptions): string[] {
  const listStart = computeListScroll({
    previous: 0,
    length: summaries.length,
    height: geometry.listHeight,
    selected,
  });
  return summaries.slice(listStart, listStart + geometry.listHeight).map((summary, index) => {
    const isSelected = listStart + index === selected;
    return listRow({
      text: theme.fg(isSelected ? THEME_ACCENT : THEME_TEXT, summary),
      width: geometry.leftWidth,
      isSelected,
      theme,
    });
  });
}
