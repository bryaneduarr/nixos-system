import type { Grapheme } from "./grapheme.interface.ts";
import type { SelectedTextLookup, SelectionRangeLookup, TextRange } from "./selection.interface.ts";

/** Whether a selection extends by characters or by whole lines. */
type SelectionMode = "character" | "line";

/** The selection started at a grapheme index. */
interface ActiveSelectionAnchor {
  /** Marks that a selection anchor is set. */
  readonly found: true;
  /** Grapheme index where the selection started. */
  readonly index: number;
}

/** No selection has started. */
interface NoSelectionAnchor {
  /** Marks that no selection anchor is set. */
  readonly found: false;
}

/** Where the active selection started, if one has started. */
export type SelectionAnchor = ActiveSelectionAnchor | NoSelectionAnchor;

/** Cursor and selection state for the text of one prompt. */
export interface PromptNavigation {
  /** Full text of the prompt. */
  readonly text: string;
  /** Graphemes of the prompt in order. */
  readonly units: readonly Grapheme[];
  /** Grapheme index of the cursor. */
  cursor: number;
  /** Where the active selection started. */
  anchor: SelectionAnchor;
  /** Whether the selection extends by characters or by lines. */
  selection: SelectionMode;
  /** Motion key waiting for its second key, such as g or y. */
  pending: string;
  /** Moves the cursor to a grapheme index, clamped to the prompt. */
  move(index: number): void;
  /** UTF-16 span of the lines that contain a grapheme index, including the newline. */
  lineRange(index: number): TextRange;
  /** Span selected between the anchor and the cursor. */
  range(): SelectionRangeLookup;
  /** Text selected between the anchor and the cursor. */
  selectedText(): SelectedTextLookup;
  /** Starts or ends a selection in the given mode. */
  toggleSelection(mode: SelectionMode): void;
  /** Moves the cursor by words in a direction, where positive is forward. */
  word(direction: number): void;
  /** Moves the cursor to the start of the current line, or to its last character when toLineEnd is true. */
  lineEdge(toLineEnd: boolean): void;
}
