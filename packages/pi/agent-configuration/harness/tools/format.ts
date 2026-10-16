import { MAX_TEXT_CHARS, MAX_TEXT_LINES } from "./config.ts";

export function stripAtPrefix(value: string): string {
  return value.startsWith("@") ? value.slice(1) : value;
}

export function splitLines(text: string): string[] {
  return text.split(/\r?\n/);
}

export function clampLines(
  text: string,
  maxLines: number,
  maxChars: number,
): { text: string; omittedLines: number; truncated: boolean } {
  const lines = splitLines(text);
  const kept = lines.slice(0, maxLines);
  let out = kept.join("\n");
  let truncated = lines.length > maxLines;
  if (out.length > maxChars) {
    out = out.slice(0, maxChars);
    truncated = true;
  }
  return {
    text: out,
    omittedLines: Math.max(0, lines.length - maxLines),
    truncated,
  };
}

export function headTail(
  text: string,
  head: number,
  tail: number,
): { text: string; omittedLines: number } {
  const lines = splitLines(text);
  if (lines.length <= head + tail) {
    return { text: lines.join("\n"), omittedLines: 0 };
  }
  const omitted = lines.length - head - tail;
  return {
    text: [
      ...lines.slice(0, head),
      `... ${omitted} lines omitted ...`,
      ...lines.slice(-tail),
    ].join("\n"),
    omittedLines: omitted,
  };
}

export function clampText(text: string): string {
  return clampLines(text, MAX_TEXT_LINES, MAX_TEXT_CHARS).text;
}

export function uniqueLines(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

export function withLineNumbers(
  lines: string[],
  startLine: number,
): string {
  const width = String(startLine + lines.length - 1).length;
  return lines
    .map((line, index) => {
      const number = String(startLine + index).padStart(width, " ");
      return `${number}: ${line}`;
    })
    .join("\n");
}

export function pluralize(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}
