import type { ScanStep } from "../../../types/source/scan-step.interface.ts";

export function createScanStep(replacement: string, consumed: number): ScanStep {
  return { replacement, consumed };
}
