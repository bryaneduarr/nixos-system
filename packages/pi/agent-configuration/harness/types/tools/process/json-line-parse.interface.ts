/** Result of parsing one line of JSON output against a schema. */
export type JsonLineParse<Event> = ValidJsonLine<Event> | InvalidJsonLine;

/** A line that parsed as JSON and matched the schema. */
interface ValidJsonLine<Event> {
  /** Marks a line that matched the schema. */
  readonly valid: true;
  /** The line as a validated event. */
  readonly event: Event;
}

/** A line that is not valid JSON or does not match the schema. */
interface InvalidJsonLine {
  /** Marks a line that cannot be used. */
  readonly valid: false;
}
