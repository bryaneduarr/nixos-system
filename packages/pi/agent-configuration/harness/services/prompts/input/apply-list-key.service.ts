import { matchesKey } from "@earendil-works/pi-tui";
import { KEY_DOWN, KEY_J, KEY_K, KEY_UP } from "../../../constants/keys/key-name.constant.ts";
import type { ListKeyContext } from "../../../types/prompts/input/list-key-context.interface.ts";

export function applyListKey(sequence: string, context: ListKeyContext): boolean {
  if (matchesKey(sequence, KEY_J) || matchesKey(sequence, KEY_DOWN)) context.select(context.selected + 1);
  else if (matchesKey(sequence, KEY_K) || matchesKey(sequence, KEY_UP)) context.select(context.selected - 1);
  else return false;
  return true;
}
