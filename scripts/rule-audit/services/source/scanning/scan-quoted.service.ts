import { BACKSLASH, NEWLINE } from "../../../constants/source/scan-characters.constant.ts";
import type { ScanState } from "../../../types/source/scan-state.interface.ts";
import type { ScanStep } from "../../../types/source/scan-step.interface.ts";
import { blankText } from "./blank-text.service.ts";
import { createScanStep } from "./create-scan-step.service.ts";

export function scanQuoted(state: ScanState, character: string, nextCharacter: string): ScanStep {
  if (character === BACKSLASH) return createScanStep(blankText(character + nextCharacter), 2);
  const endsString = character === state.quote || character === NEWLINE;
  if (!endsString) return createScanStep(" ", 1);
  state.mode = "code";
  state.quote = "";
  state.previousCodeCharacter = character;
  return createScanStep(character, 1);
}
