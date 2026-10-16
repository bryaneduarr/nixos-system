import type { JsonLineParse } from "../../../types/tools/process/json-line-parse.interface.ts";

export function parseJsonLine(line: string): JsonLineParse {
  try {
    return { parsed: true, value: JSON.parse(line) };
  } catch {
    return { parsed: false };
  }
}
