import type { ValueState } from "../../../types/activity/value-state.interface.ts";

export function readStringList(value: unknown): ValueState<string[]> {
  if (!isUnknownArray(value)) return { state: "absent" };
  return { state: "present", value: value.filter(isString) };
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isString(element: unknown): element is string {
  return typeof element === "string";
}
