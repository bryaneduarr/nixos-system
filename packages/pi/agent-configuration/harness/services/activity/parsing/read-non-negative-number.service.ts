import { isNonNegativeNumber } from "./is-non-negative-number.service.ts";

export function readNonNegativeNumber(value: unknown): number {
  return isNonNegativeNumber(value) ? value : 0;
}
