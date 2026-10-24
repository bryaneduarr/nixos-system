import type { ScanState } from "../../../types/source/scan-state.interface.ts";
import type { ScanStep } from "../../../types/source/scan-step.interface.ts";
import { blankText } from "./blank-text.service.ts";
import { createScanStep } from "./create-scan-step.service.ts";

export function scanBlockComment(state: ScanState, character: string, nextCharacter: string): ScanStep {
  if (character + nextCharacter !== "*/") return createScanStep(blankText(character), 1);
  state.mode = "code";
  return createScanStep("  ", 2);
}
