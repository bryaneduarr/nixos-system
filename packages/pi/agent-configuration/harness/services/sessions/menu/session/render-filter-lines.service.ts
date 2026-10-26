import type { Input } from "@earendil-works/pi-tui";
import { MENU_FILTER_RENDER_MARGIN } from "../../../../constants/sessions/menu/menu.constant.ts";

export function renderFilterLines(filter: Input, filtering: boolean, width: number): string[] {
  const isFilterVisible = filtering || filter.getValue() !== "";
  return isFilterVisible ? filter.render(Math.max(1, width - MENU_FILTER_RENDER_MARGIN)) : [];
}
