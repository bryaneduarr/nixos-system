import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import { renderBox } from "../../../ui/formatting.ts";

export function boxDetails(title: string, text: string, color: ThemeColor, width: number): DetailLine[] {
  const wrappedLines = text.split(/\r?\n/);
  return renderBox(title, wrappedLines, width).map((line) => ({ text: line, color, bold: false }));
}
