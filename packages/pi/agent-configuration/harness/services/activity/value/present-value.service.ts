import type { ValueState } from "../../../types/activity/value-state.interface.ts";

export function presentValue<T>(state: ValueState<T>): T | undefined {
  return state.state === "present" ? state.value : undefined;
}
