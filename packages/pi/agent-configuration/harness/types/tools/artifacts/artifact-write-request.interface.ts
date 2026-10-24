/** A file to store under the work directory. */
export interface ArtifactWriteRequest {
  /** Session directory the work directory lives in. */
  readonly cwd: string;
  /** Folder under the work directory that groups artifacts of one kind. */
  readonly kind: string;
  /** File extension without the dot. */
  readonly extension: string;
  /** Text stored in the file. */
  readonly content: string;
}
