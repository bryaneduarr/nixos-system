import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function readNonEmptyStringState(value: unknown): ValueState<string> {
  return typeof value === "string" && value.length > 0 ? { state: "present", value } : { state: "absent" };
}
