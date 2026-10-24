import { matchesKey } from "@earendil-works/pi-tui";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";

export function moveSessionSelection(
  visible: readonly LiveSession[],
  selection: ValueState<string>,
  key: string,
): ValueState<string> {
  const index = selection.state === "present" ? visible.findIndex((row) => row.identity === selection.value) : -1;
  const target = visible[nextSelectionIndex(index, visible.length, key)];
  return target ? { state: "present", value: target.identity } : { state: "absent" };
}

function nextSelectionIndex(index: number, length: number, key: string): number {
  if (matchesKey(key, "k") || matchesKey(key, "up")) return Math.max(0, index - 1);
  if (matchesKey(key, "j") || matchesKey(key, "down")) return Math.min(length - 1, index + 1);
  return index;
}
