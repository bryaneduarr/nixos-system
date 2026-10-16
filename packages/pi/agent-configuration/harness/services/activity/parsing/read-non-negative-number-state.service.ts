import type { ValueState } from "../../../types/activity/value-state.interface.ts";

export function readNonNegativeNumberState(value: unknown): ValueState<number> {
  return isNonNegativeNumber(value) ? { state: "present", value } : { state: "absent" };
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
