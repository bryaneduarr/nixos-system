import { SPACE } from "../../../constants/render/card-layout.constant.ts";
import {
  DELETE_CONTROL_CODE,
  MAX_C0_CONTROL_CODE,
  MAX_C1_CONTROL_CODE,
  MIN_C1_CONTROL_CODE,
} from "../../../constants/render/control-character.constant.ts";

const WHITESPACE_RUN_PATTERN = /\s+/g;

function isControlCharacter(character: string): boolean {
  const charCode = character.charCodeAt(0);
  const isC0Control = charCode <= MAX_C0_CONTROL_CODE;
  const isDeleteControl = charCode === DELETE_CONTROL_CODE;
  const isC1Control = charCode >= MIN_C1_CONTROL_CODE && charCode <= MAX_C1_CONTROL_CODE;
  return isC0Control || isDeleteControl || isC1Control;
}

function replaceControlCharacter(character: string): string {
  return isControlCharacter(character) ? SPACE : character;
}

export function sanitizeCardText(text: string): string {
  return Array.from(text, replaceControlCharacter).join("").replace(WHITESPACE_RUN_PATTERN, SPACE).trim();
}
