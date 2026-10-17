import type { SelectionAnchor } from "../../../types/prompts/prompt-navigation.interface.ts";

export function isSameSelectionAnchor(first: SelectionAnchor, second: SelectionAnchor): boolean {
  if (!first.found || !second.found) return first.found === second.found;
  return first.index === second.index;
}
