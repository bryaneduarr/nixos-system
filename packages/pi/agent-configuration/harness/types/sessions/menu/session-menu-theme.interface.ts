import type { Theme } from "@earendil-works/pi-coding-agent";

/** Theme functions that the session menu uses to color its lines. */
export interface SessionMenuTheme {
  /** Styles text with a foreground color. */
  readonly fg: Theme["fg"];
  /** Styles text in bold. */
  readonly bold: Theme["bold"];
  /** Styles text with the given options. */
  readonly style: Theme["style"];
}
