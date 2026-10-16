import type { ValueState } from "../../../types/activity/value-state.interface.ts";

export function toValueState<T>(value: T | undefined): ValueState<T> {
  return value === undefined ? { state: "absent" } : { state: "present", value };
}
