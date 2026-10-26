export const REPLACEMENT_CHARACTER = "�";
export const TAB_DISPLAY_TEXT = "    ";
export const UNSAFE_DISPLAY_CODE_RANGES: readonly (readonly [number, number])[] = [
  [0x00, 0x1f],
  [0x7f, 0x9f],
  [0x202a, 0x202e],
  [0x2066, 0x2069],
];
export const LINE_START_COLUMN = 0;
