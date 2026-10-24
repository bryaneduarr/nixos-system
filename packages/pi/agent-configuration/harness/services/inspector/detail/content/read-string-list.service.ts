import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { isUnknownArray } from "../../../values/is-unknown-array.service.ts";

export function readStringList(value: unknown): ValueState<string[]> {
  if (!isUnknownArray(value)) return { state: "absent" };
  return { state: "present", value: value.filter(isString) };
}

function isString(element: unknown): element is string {
  return typeof element === "string";
}
