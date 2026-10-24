/** Removes a file. */
export interface DeleteChange {
  /** Marks a deletion. */
  readonly op: "delete";
  /** Target file as the caller wrote it. */
  readonly path: string;
}
