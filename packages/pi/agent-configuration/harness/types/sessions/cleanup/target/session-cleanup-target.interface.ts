/** Session row fields that decide whether its pane can close after the process exits. */
export interface SessionCleanupTarget {
  /** Whether Pi launched this session through the session manager. */
  readonly owned: boolean;
  /** Whether the conversation has any user or agent history. */
  readonly historyEver: boolean;
  /** Whether the session has no work that would be lost by closing its pane. */
  readonly cleanupSafe: boolean;
  /** Boot and start-time identity of the Pi process. */
  readonly processStart: string;
  /** Process identifier of the Pi process. */
  readonly pid: number;
  /** Absolute path of the Herdr socket used to inspect and close the pane. */
  readonly socket: string;
  /** Herdr pane identifier that hosts the session. */
  readonly pane: string;
  /** Herdr tab identifier that contains the pane. */
  readonly tab: string;
  /** Herdr workspace identifier that contains the tab. */
  readonly workspace: string;
}
