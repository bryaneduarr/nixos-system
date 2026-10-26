import { ANSI_ESCAPE, ANSI_RESET_SEQUENCE } from "../../../constants/render/card-color.constant.ts";
import type { PaintTextInput } from "../../../types/render/paint-text.interface.ts";

export function paintText(input: PaintTextInput): string {
  const isPaintable = input.colorEnabled && input.text !== "";
  return isPaintable ? `${ANSI_ESCAPE}[${input.sgr}m${input.text}${ANSI_RESET_SEQUENCE}` : input.text;
}
