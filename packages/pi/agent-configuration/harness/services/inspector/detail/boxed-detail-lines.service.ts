import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import { LINE_BREAK_PATTERN } from "../../../constants/inspector/text.constant.ts";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import { renderBox } from "../../tool-rendering/box/render-box.service.ts";

export function boxedDetailLines(title: string, text: string, color: ThemeColor, width: number): DetailLine[] {
  const textLines = text.split(LINE_BREAK_PATTERN);
  return renderBox(title, textLines, width).map((line) => ({ text: line, color, bold: false }));
}
