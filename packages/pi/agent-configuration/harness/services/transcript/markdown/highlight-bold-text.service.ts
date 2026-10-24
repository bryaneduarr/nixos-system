import { getTerminalColorMode, parseColor, styleText } from "@earendil-works/pi-tui";
import { BOLD_TEXT_COLOR } from "../../../constants/transcript/bold-text.constant.ts";

const INLINE_CODE_PATTERN = /(`+[^`\n]*`+)/;
const BOLD_PATTERN = /\*\*(\S(?:[^*\n]*\S)?)\*\*/g;
const CODE_SPAN_PARITY = 1;

export function highlightBoldText(prose: string): string {
  const mode = getTerminalColorMode();
  const boldStyle = { fg: parseColor(BOLD_TEXT_COLOR), bold: true };
  return prose
    .split(INLINE_CODE_PATTERN)
    .map((part, index) =>
      index % 2 === CODE_SPAN_PARITY
        ? part
        : part.replace(BOLD_PATTERN, (_match, text: string) => styleText(text, boldStyle, mode)),
    )
    .join("");
}
