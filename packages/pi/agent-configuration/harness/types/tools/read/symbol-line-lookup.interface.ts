/** Result of naming the symbol declared on one line of a file. */
export type SymbolLineLookup = FoundSymbolLine | MissingSymbolLine;

/** A line that declares a symbol. */
interface FoundSymbolLine {
  /** Marks a line that declares a symbol. */
  readonly found: true;
  /** Display name of the symbol; methods end with parentheses. */
  readonly name: string;
}

/** A line that declares no symbol. */
interface MissingSymbolLine {
  /** Marks a line without a declaration. */
  readonly found: false;
}
