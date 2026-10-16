import type { LiveSession } from "./live-session.interface.ts";

/** A registry row that passed validation. */
interface ValidSessionRow {
  /** Marks that the row passed validation. */
  readonly valid: true;
  /** The validated live session record. */
  readonly row: LiveSession;
}

/** A registry row that failed validation. */
interface InvalidSessionRow {
  /** Marks that the row failed validation. */
  readonly valid: false;
}

/** Outcome of checking one registry row read from disk. */
export type SessionRowParse = ValidSessionRow | InvalidSessionRow;
