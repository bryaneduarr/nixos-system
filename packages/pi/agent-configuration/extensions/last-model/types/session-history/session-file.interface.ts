/** Session history file found while searching for the most recent model. */
export interface SessionFile {
  /** Absolute path of the session file. */
  readonly path: string;
  /** Last modification time of the session file in milliseconds. */
  readonly modified: number;
}

/** Result of listing the session history directory. */
export type SessionFileListing =
  | { readonly listed: true; readonly files: readonly SessionFile[] }
  | { readonly listed: false };

/** Session file the history search skips, or none when the current session has no file yet. */
export type ExcludedSessionFile = { readonly state: "excluded"; readonly path: string } | { readonly state: "none" };
