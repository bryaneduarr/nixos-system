import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function readBooleanState(value: unknown): ValueState<boolean> {
  return typeof value === "boolean" ? { state: "present", value } : { state: "absent" };
}
