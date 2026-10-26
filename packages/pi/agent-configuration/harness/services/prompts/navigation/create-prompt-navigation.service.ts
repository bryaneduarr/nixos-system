import type { PromptNavigation } from "../../../types/prompts/navigation/prompt-navigation.interface.ts";
import { findLineEdgeIndex } from "./find-line-edge-index.service.ts";
import { findLineRange } from "./find-line-range.service.ts";
import { findSelectionSpan } from "./find-selection-span.service.ts";
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
      return { found: true, range: findSelectionSpan(units, low, high) };
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
    lineEdge(toLineEnd) {
      navigation.move(findLineEdgeIndex(units, navigation.lineRange(navigation.cursor), toLineEnd));
    },
  };
  return navigation;
}
