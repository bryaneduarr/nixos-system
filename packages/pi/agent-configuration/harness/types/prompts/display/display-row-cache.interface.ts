import type { Grapheme } from "../navigation/grapheme.interface.ts";
import type { DisplayRow } from "./display-row.interface.ts";

/** Wrapped rows of a prompt kept for the widths it was shown at. */
export interface DisplayRowCache {
  /** Wrapped rows for a width, computed from the graphemes when not cached. */
  rows(units: readonly Grapheme[], width: number): readonly DisplayRow[];
  /** Drops every cached set of rows. */
  clear(): void;
}
