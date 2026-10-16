import { visibleWidth } from "@earendil-works/pi-tui";
import { REPLACEMENT_CHARACTER } from "../../../constants/prompts/layout.constant.ts";
import type { DisplayCell, DisplayRow } from "../../../types/prompts/display-row.interface.ts";
import type { Grapheme } from "../../../types/prompts/grapheme.interface.ts";
import { safeDisplay } from "./safe-display.service.ts";

export function wrapPrompt(units: readonly Grapheme[], width: number): DisplayRow[] {
  const columns = Math.max(1, width);
  const rows: DisplayRow[] = [];
  let row: DisplayCell[] = [];
  let column = 0;
  for (const [index, unit] of units.entries()) {
    if (unit.text.includes("\n")) {
      row.push({ index, text: "", column, width: 0 });
      rows.push(row);
      row = [];
      column = 0;
      continue;
    }
    const displayed = fitGraphemeToColumns(safeDisplay(unit.text), columns);
    if (column + displayed.width > columns && row.length > 0) {
      rows.push(row);
      row = [];
      column = 0;
    }
    row.push({ index, text: displayed.text, column, width: displayed.width });
    column += displayed.width;
  }
  rows.push(row);
  return rows;
}

function fitGraphemeToColumns(text: string, columns: number): Pick<DisplayCell, "text" | "width"> {
  const size = visibleWidth(text);
  if (size > columns) return { text: REPLACEMENT_CHARACTER, width: 1 };
  return { text, width: size };
}
