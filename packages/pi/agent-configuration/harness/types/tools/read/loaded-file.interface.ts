/** A file read from disk, split into lines for the read tool. */
export interface LoadedFile {
  /** Path as the caller wrote it, without the @ prefix. */
  readonly displayPath: string;
  /** Absolute path used for file system calls. */
  readonly absolutePath: string;
  /** Full file text. */
  readonly content: string;
  /** Lines of the file without the empty line after a final newline. */
  readonly lines: readonly string[];
}
