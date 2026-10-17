import type { SessionMenuUi } from "./session-menu-ui.interface.ts";

/** The parts of Pi's context that the session menu reads. */
export interface SessionMenuContext {
  /** Pi interface used to show the menu. */
  readonly ui: SessionMenuUi;
}
