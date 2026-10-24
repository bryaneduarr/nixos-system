import { LINE_BREAK_PATTERN } from "../../../../constants/inspector/detail/text.constant.ts";
import type { BoxedDetailLinesOptions } from "../../../../types/inspector/detail/boxed-detail-lines-options.interface.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import { renderBox } from "../../../tool-rendering/box/render-box.service.ts";

export function boxedDetailLines({ title, text, color, width }: BoxedDetailLinesOptions): DetailLine[] {
  const textLines = text.split(LINE_BREAK_PATTERN);
  return renderBox(title, textLines, width).map((line) => ({ text: line, color, bold: false }));
}
