import { NEWLINE } from "../../../constants/source/scan-characters.constant.ts";
import type { ScanState, ScanStep } from "../../../types/source/scan-state.interface.ts";
import { createScanStep } from "./create-scan-step.service.ts";

export function scanLineComment(state: ScanState, character: string): ScanStep {
  if (character !== NEWLINE) return createScanStep(" ", 1);
  state.mode = "code";
  return createScanStep(NEWLINE, 1);
}
