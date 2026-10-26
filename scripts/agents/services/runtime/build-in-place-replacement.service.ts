import {
  CARRIAGE_RETURN,
  CONTROL_SEQUENCE_INTRODUCER,
  CURSOR_UP_FINAL_BYTE,
  ERASE_BELOW_SEQUENCE,
} from "../../constants/runtime/terminal-sequence.constant.ts";

export function buildInPlaceReplacement(previousRowCount: number, text: string): string {
  const cursorUpSequence = `${CONTROL_SEQUENCE_INTRODUCER}${previousRowCount}${CURSOR_UP_FINAL_BYTE}`;
  const moveUpSequence = previousRowCount > 0 ? cursorUpSequence : "";
  return `${CARRIAGE_RETURN}${moveUpSequence}${ERASE_BELOW_SEQUENCE}${text}`;
}
