import type { InspectorRow } from "./inspector-row.interface.ts";

/** Result of looking up a tool list row, which may not exist. */
export type InspectorRowLookup = InspectorRowFound | InspectorRowMissing;

/** A row was found at the lookup position. */
interface InspectorRowFound {
  /** Discriminates a found row. */
  readonly found: true;
  /** Row at the lookup position. */
  readonly row: InspectorRow;
}

/** No row exists at the lookup position. */
interface InspectorRowMissing {
  /** Discriminates a missing row. */
  readonly found: false;
}
