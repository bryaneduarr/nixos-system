export function isPositiveSafeInteger(candidate: unknown): candidate is number {
  return typeof candidate === "number" && Number.isSafeInteger(candidate) && candidate >= 1;
}
