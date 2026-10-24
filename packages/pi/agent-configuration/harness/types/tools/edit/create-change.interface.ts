/** Writes a new file. */
export interface CreateChange {
  /** Marks a file creation. */
  readonly op: "create";
  /** Target file as the caller wrote it. */
  readonly path: string;
  /** Contents of the new file. */
  readonly content: string;
  /** Whether an existing file may be replaced. */
  readonly overwrite: boolean;
}
