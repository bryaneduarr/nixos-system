/** Renames or relocates a file. */
export interface MoveChange {
  /** Marks a move. */
  readonly op: "move";
  /** Source file as the caller wrote it. */
  readonly path: string;
  /** Destination path as the caller wrote it. */
  readonly destination: string;
  /** Whether an existing destination may be replaced. */
  readonly overwrite: boolean;
}
