import type { ThemeColor } from "@earendil-works/pi-coding-agent";

/** Inputs for drawing a titled box of detail text. */
export interface BoxedDetailLinesOptions {
  /** Title drawn in the box border. */
  readonly title: string;
  /** Text drawn inside the box. */
  readonly text: string;
  /** Color applied to every line of the box. */
  readonly color: ThemeColor;
  /** Width available for the box. */
  readonly width: number;
}
