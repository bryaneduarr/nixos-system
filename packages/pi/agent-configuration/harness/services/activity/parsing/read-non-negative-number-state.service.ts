import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { isNonNegativeNumber } from "./is-non-negative-number.service.ts";

export function readNonNegativeNumberState(value: unknown): ValueState<number> {
  return isNonNegativeNumber(value) ? { state: "present", value } : { state: "absent" };
}
