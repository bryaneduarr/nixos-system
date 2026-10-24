import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function readStringState(value: unknown): ValueState<string> {
  return typeof value === "string" ? { state: "present", value } : { state: "absent" };
}
