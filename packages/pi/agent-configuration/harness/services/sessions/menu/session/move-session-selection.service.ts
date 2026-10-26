import { matchesKey } from "@earendil-works/pi-tui";
import { KEY_DOWN, KEY_J, KEY_K, KEY_UP } from "../../../../constants/keys/key-name.constant.ts";
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
  if (matchesKey(key, KEY_K) || matchesKey(key, KEY_UP)) return Math.max(0, index - 1);
  if (matchesKey(key, KEY_J) || matchesKey(key, KEY_DOWN)) return Math.min(length - 1, index + 1);
  return index;
}
