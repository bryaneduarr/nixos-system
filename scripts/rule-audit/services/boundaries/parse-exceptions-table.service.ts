import {
  EXCEPTIONS_HEADING,
  TABLE_HEADER_ROWS,
  TABLE_ROW_PREFIX,
} from "../../constants/boundaries/exceptions-table.constant.ts";
import type { ExceptionsTableRow } from "../../types/boundaries/exceptions-table-row.interface.ts";

function readCell(cell: string): string {
  return cell.trim().replace(/^`(.*)`$/, "$1");
}

function readRow(line: string): ExceptionsTableRow {
  const [file = "", rule = "", reason = ""] = line.trim().slice(1, -1).split("|").map(readCell);
  return { file, rule, reason };
}

export function parseExceptionsTable(markdown: string): readonly ExceptionsTableRow[] {
  const lines = markdown.split("\n");
  const headingIndex = lines.findIndex((line) => line.trim() === EXCEPTIONS_HEADING);
  if (headingIndex === -1) return [];
  const sectionLines = lines.slice(headingIndex + 1);
  const nextHeadingIndex = sectionLines.findIndex((line) => line.startsWith("#"));
  const section = nextHeadingIndex === -1 ? sectionLines : sectionLines.slice(0, nextHeadingIndex);
  return section
    .filter((line) => line.trim().startsWith(TABLE_ROW_PREFIX))
    .slice(TABLE_HEADER_ROWS)
    .map(readRow);
}
