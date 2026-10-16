export function readNonNegativeNumber(value: unknown): number {
  return isNonNegativeNumber(value) ? value : 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
