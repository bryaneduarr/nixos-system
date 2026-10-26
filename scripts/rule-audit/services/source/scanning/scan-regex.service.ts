import { BACKSLASH, NEWLINE, SLASH } from "../../../constants/source/scan-characters.constant.ts";
import type { ScanState } from "../../../types/source/scan-state.interface.ts";
import type { ScanStep } from "../../../types/source/scan-step.interface.ts";
import { blankText } from "./blank-text.service.ts";
import { createScanStep } from "./create-scan-step.service.ts";

export function scanRegex(state: ScanState, character: string, nextCharacter: string): ScanStep {
  if (character === BACKSLASH) return createScanStep(blankText(character + nextCharacter), 2);
  if (character === "[") state.inCharacterClass = true;
  if (character === "]") state.inCharacterClass = false;
  const endsRegex = (character === SLASH && !state.inCharacterClass) || character === NEWLINE;
  if (!endsRegex) return createScanStep(blankText(character), 1);
  state.mode = "code";
  state.inCharacterClass = false;
  state.previousCodeCharacter = character;
  return createScanStep(character, 1);
}
