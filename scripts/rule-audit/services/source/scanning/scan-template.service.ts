import { BACKSLASH, BACKTICK } from "../../../constants/source/scan-characters.constant.ts";
import type { ScanState } from "../../../types/source/scan-state.interface.ts";
import type { ScanStep } from "../../../types/source/scan-step.interface.ts";
import { blankText } from "./blank-text.service.ts";
import { createScanStep } from "./create-scan-step.service.ts";

export function scanTemplate(state: ScanState, character: string, nextCharacter: string): ScanStep {
  if (character === BACKSLASH) return createScanStep(blankText(character + nextCharacter), 2);
  if (character === BACKTICK) {
    state.mode = "code";
    state.previousCodeCharacter = character;
    return createScanStep(character, 1);
  }
  if (character + nextCharacter === "${") {
    state.templateExpressionDepths = [...state.templateExpressionDepths, state.braceDepth];
    state.braceDepth += 1;
    state.mode = "code";
    return createScanStep("${", 2);
  }
  return createScanStep(blankText(character), 1);
}
