import type { SourceLine } from "./source-line.interface.ts";

/** A project file read for auditing. */
export interface AuditedFile {
  /** File path relative to the audited project directory. */
  readonly file: string;
  /** Lines of the file prepared for rules. */
  readonly lines: readonly SourceLine[];
}
