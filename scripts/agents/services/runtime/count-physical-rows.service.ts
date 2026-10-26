import { measureVisibleLength } from "../usage/render/measure-visible-length.service.ts";

export function countPhysicalRows(frame: string, columns: number): number {
  // A frame ends with a line break, so the last split segment is not a line.
  const terminatedLines = frame.split("\n").slice(0, -1);
  return terminatedLines.reduce((rowCount, line) => rowCount + countLineRows(line, columns), 0);
}

function countLineRows(line: string, columns: number): number {
  return Math.max(1, Math.ceil(measureVisibleLength(line) / columns));
}
