import type { Theme } from "@earendil-works/pi-coding-agent";

/** The parts of Pi's theme that the subagent card paints with. */
export interface SubagentCardTheme {
  /** Colors a text with a theme color. */
  readonly fg: Theme["fg"];
  /** Makes a text bold. */
  readonly bold: Theme["bold"];
}
