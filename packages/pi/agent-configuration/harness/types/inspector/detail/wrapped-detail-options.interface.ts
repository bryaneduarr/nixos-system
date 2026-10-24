import type { Theme } from "@earendil-works/pi-coding-agent";
import type { DetailArtifact } from "./detail-artifact.interface.ts";
import type { InspectorRowLookup } from "./inspector-row-lookup.interface.ts";

/** Inputs for building the styled, wrapped detail lines of the selected row. */
export interface WrappedDetailOptions {
  /** Row whose details are shown, which may not exist. */
  readonly lookup: InspectorRowLookup;
  /** Width of the detail pane in columns. */
  readonly width: number;
  /** Theme used for colors and emphasis. */
  readonly theme: Theme;
  /** Text shown in place of the tool result. */
  readonly artifact: DetailArtifact;
}
