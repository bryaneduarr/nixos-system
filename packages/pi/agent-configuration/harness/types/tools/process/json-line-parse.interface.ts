/* Result of parsing one line of JSON output. */
export type JsonLineParse = ParsedJsonLine | UnparsedJsonLine;

/* A line that parsed as JSON. */
interface ParsedJsonLine {
  /* Marks a successful parse. */
  readonly parsed: true;
  /* Parsed value, not yet validated. */
  readonly value: unknown;
}

/* A line that is not valid JSON. */
interface UnparsedJsonLine {
  /* Marks a failed parse. */
  readonly parsed: false;
}
