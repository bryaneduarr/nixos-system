import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";

export function readArgumentText(args: Record<string, unknown>, key: string): ValueState<string> {
  const argument = args[key];
  if (argument === undefined || argument === null) return { state: "absent" };
  return { state: "present", value: String(argument) };
}
