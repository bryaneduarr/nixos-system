/** Inputs for coloring a piece of text with one ANSI style. */
export interface PaintTextInput {
  /** Text to color; empty text is returned unchanged. */
  readonly text: string;
  /** Select Graphic Rendition parameters, such as `32` for green. */
  readonly sgr: string;
  /** Whether ANSI color escapes may be written. */
  readonly colorEnabled: boolean;
}
