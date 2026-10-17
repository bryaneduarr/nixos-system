/** Start offset and exclusive end offset of a selected span. */
export type TextRange = [number, number];

/** A selected span exists. */
interface FoundSelectionRange {
  /** Marks that a selection is active. */
  readonly found: true;
  /** Offsets of the selected span. */
  readonly range: TextRange;
}

/** No selection is active. */
interface NoSelectionRange {
  /** Marks that no selection is active. */
  readonly found: false;
}

/** Result of looking up the active selection span. */
export type SelectionRangeLookup = FoundSelectionRange | NoSelectionRange;

/** The selected text exists. */
interface FoundSelectedText {
  /** Marks that a selection is active. */
  readonly found: true;
  /** Text inside the selected span. */
  readonly text: string;
}

/** No selection is active. */
interface NoSelectedText {
  /** Marks that no selection is active. */
  readonly found: false;
}

/** Result of looking up the selected text. */
export type SelectedTextLookup = FoundSelectedText | NoSelectedText;
