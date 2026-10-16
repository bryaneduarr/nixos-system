import type { DetailArtifact } from "./detail-artifact.interface.ts";
import type { InspectorRow } from "./inspector-row.interface.ts";

/** Inputs for building the detail lines of one selected row. */
export interface DetailOptions {
  /** Row whose details are built. */
  readonly row: InspectorRow;
  /** Width available for wrapped boxes. */
  readonly width: number;
  /** Text shown in place of the tool result. */
  readonly artifact: DetailArtifact;
}
