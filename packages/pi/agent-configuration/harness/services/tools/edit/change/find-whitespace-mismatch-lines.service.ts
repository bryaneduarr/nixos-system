import { splitLines } from "../../text/split-lines.service.ts";

const MAX_REPORTED_LINES = 5;

export function findWhitespaceMismatchLines(content: string, oldText: string): number[] {
  const firstOldLine = splitLines(oldText)
    .map((line) => line.trim())
    .find((line) => line !== "");
  if (firstOldLine === undefined) return [];

  const lineNumbers: number[] = [];
  for (const [index, line] of splitLines(content).entries()) {
    if (line.trim() === firstOldLine) lineNumbers.push(index + 1);
    if (lineNumbers.length === MAX_REPORTED_LINES) break;
  }
  return lineNumbers;
}
