/** A file read with the part of it to return. */
export interface ReadRequest {
  /** Directory relative paths resolve against. */
  readonly cwd: string;
  /** File to read, absolute or relative to cwd. */
  readonly path: string;
  /** Part of the file to return. */
  readonly selection: ReadSelection;
}

/** Part of a file a read returns. */
export type ReadSelection = SymbolSelection | LineRangeSelection | AutomaticSelection;

/** The body of one named symbol. */
interface SymbolSelection {
  /** Marks a symbol selection. */
  readonly kind: "symbol";
  /** Name of the symbol, untrimmed as the caller wrote it. */
  readonly symbol: string;
}

/** A bounded range of lines. */
interface LineRangeSelection {
  /** Marks a line-range selection. */
  readonly kind: "lines";
  /** One-based first line to return. */
  readonly startLine: number;
  /** Maximum number of lines to return. */
  readonly lineCount: number;
}

/** No explicit selection; large files return structure and small files return all lines. */
interface AutomaticSelection {
  /** Marks an automatic selection. */
  readonly kind: "automatic";
}
