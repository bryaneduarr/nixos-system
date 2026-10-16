import type { ScanStep } from "../../../types/source/scan-state.interface.ts";

export function createScanStep(replacement: string, consumed: number): ScanStep {
  return { replacement, consumed };
}
