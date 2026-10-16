import {
  REPLACEMENT_CHARACTER,
  TAB_DISPLAY_TEXT,
  UNSAFE_DISPLAY_CODE_RANGES,
} from "../../../constants/prompts/layout.constant.ts";

function isUnsafeDisplayCode(code: number): boolean {
  return UNSAFE_DISPLAY_CODE_RANGES.some(([low, high]) => code >= low && code <= high);
}

export function safeDisplay(text: string): string {
  return Array.from(text, (character) => {
    if (character === "\t") return TAB_DISPLAY_TEXT;
    return isUnsafeDisplayCode(character.charCodeAt(0)) ? REPLACEMENT_CHARACTER : character;
  }).join("");
}
