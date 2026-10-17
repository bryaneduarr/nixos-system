import type { ExtensionUIContext } from "@earendil-works/pi-coding-agent";

/** The parts of Pi's context that the project picker reads and asks through. */
export interface ProjectPickerContext {
  /** Working directory of the current session, the first project offered. */
  readonly cwd: string;
  /** Pi interface used to ask for a choice or a typed path. */
  readonly ui: Pick<ExtensionUIContext, "input" | "select">;
}
