import { visibleWidth } from "@earendil-works/pi-tui";
import { SUMMARY_SEPARATOR } from "../../../constants/activity/summary/summary-layout.constant.ts";

export function wrapFooterParts(parts: readonly string[], availableWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const part of parts) {
    const candidate = line ? `${line}${SUMMARY_SEPARATOR}${part}` : part;
    if (line && visibleWidth(candidate) > availableWidth) {
      lines.push(line);
      line = part;
    } else {
      line = candidate;
    }
  }
  lines.push(line);
  return lines;
}
