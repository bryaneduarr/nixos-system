/** Result of looking up a symbol's line range in a file. */
export type SymbolRangeLookup = FoundSymbolRange | MissingSymbolRange;

/** A symbol that was found, with its zero-based first and last line. */
interface FoundSymbolRange {
  /** Marks a successful lookup. */
  readonly found: true;
  /** Zero-based index of the declaration line. */
  readonly start: number;
  /** Zero-based index of the last line of the body. */
  readonly end: number;
}

/** A symbol that does not appear in the file. */
interface MissingSymbolRange {
  /** Marks a failed lookup. */
  readonly found: false;
}
