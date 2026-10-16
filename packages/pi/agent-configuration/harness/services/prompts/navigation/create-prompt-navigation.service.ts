import type { PromptNavigation } from "../../../types/prompts/prompt-navigation.interface.ts";
import { findLineEdgeIndex } from "./find-line-edge-index.service.ts";
import { findLineRange } from "./find-line-range.service.ts";
import { findWordIndex } from "./find-word-index.service.ts";
import { segmentGraphemes } from "./segment-graphemes.service.ts";

export function createPromptNavigation(text: string): PromptNavigation {
  const units = segmentGraphemes(text);
  const navigation: PromptNavigation = {
    text,
    units,
    cursor: 0,
    anchor: { found: false },
    selection: "character",
    pending: "",
    move(index) {
      navigation.cursor = Math.max(0, Math.min(index, Math.max(0, units.length - 1)));
    },
    lineRange(index) {
      return findLineRange(text, units, index);
    },
    range() {
      const anchor = navigation.anchor;
      if (!anchor.found) return { found: false };
      const low = Math.min(anchor.index, navigation.cursor);
      const high = Math.max(anchor.index, navigation.cursor);
      if (navigation.selection === "line") {
        return { found: true, range: [navigation.lineRange(low)[0], navigation.lineRange(high)[1]] };
      }
      return { found: true, range: [units[low]?.start ?? 0, units[high]?.end ?? 0] };
    },
    selectedText() {
      const selection = navigation.range();
      return selection.found ? { found: true, text: text.slice(...selection.range) } : { found: false };
    },
    toggleSelection(mode) {
      const anchor = navigation.anchor;
      if (anchor.found && navigation.selection === mode) {
        navigation.anchor = { found: false };
        return;
      }
      navigation.anchor = anchor.found ? anchor : { found: true, index: navigation.cursor };
      navigation.selection = mode;
    },
    word(direction) {
      navigation.move(findWordIndex(units, navigation.cursor, direction));
    },
    lineEdge(end) {
      navigation.move(findLineEdgeIndex(units, navigation.lineRange(navigation.cursor), end));
    },
  };
  return navigation;
}
