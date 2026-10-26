import {
  SYMBOL_FALLBACK_LINE_SPAN,
  SYMBOL_SCAN_LINE_LIMIT,
} from "../../../constants/tools/read/read-limits.constant.ts";

function braceDepthChange(line: string): number {
  let change = 0;
  for (const character of line) {
    if (character === "{") change += 1;
    else if (character === "}") change -= 1;
  }
  return change;
}

export function findSymbolEnd(lines: readonly string[], start: number): number {
  let depth = 0;
  let seenBrace = false;
  for (const [offset, line] of lines.slice(start).entries()) {
    depth += braceDepthChange(line);
    seenBrace = seenBrace || line.includes("{");
    const isBlockClosed = seenBrace && depth <= 0;
    const isUnbracedLimitReached = !seenBrace && offset >= SYMBOL_SCAN_LINE_LIMIT;
    if (isBlockClosed || isUnbracedLimitReached) return start + offset;
  }
  return Math.min(lines.length - 1, start + SYMBOL_FALLBACK_LINE_SPAN);
}
