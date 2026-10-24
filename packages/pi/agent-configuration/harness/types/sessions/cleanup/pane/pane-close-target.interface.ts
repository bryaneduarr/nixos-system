import type { ShellCheck } from "./shell-check.interface.ts";

/** Process and pane identities that a detached worker uses to close a pane safely. */
export interface PaneCloseTarget {
  /** Process identifier of the Pi process whose exit is awaited. */
  readonly pid: number;
  /** Boot and start-time identity of the Pi process. */
  readonly processStart: string;
  /** Herdr pane identifier to close. */
  readonly pane: string;
  /** Herdr tab identifier that contains the pane. */
  readonly tab: string;
  /** Herdr workspace identifier that contains the tab. */
  readonly workspace: string;
  /** Shell identity to verify before closing, when the exit was explicit. */
  readonly shell: ShellCheck;
}
