import { NON_NEWLINE_CHARACTER } from "../../../constants/source/scan-characters.constant.ts";

export function blankText(text: string): string {
  return text.replace(NON_NEWLINE_CHARACTER, " ");
}
