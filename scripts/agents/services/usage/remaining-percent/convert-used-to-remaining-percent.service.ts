import { MAX_PERCENT, MIN_PERCENT } from "../../../constants/usage/percent-range.constant.ts";

export function convertUsedToRemainingPercent(usedPercent: number): number {
  const remainingPercent = MAX_PERCENT - usedPercent;
  return Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, remainingPercent));
}
