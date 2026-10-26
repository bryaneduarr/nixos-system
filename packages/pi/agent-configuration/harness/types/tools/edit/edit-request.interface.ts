import type { EditChange } from "./edit-change.interface.ts";

/** A file change requested by the edit tool. */
export interface EditRequest {
  /** Directory relative paths resolve against. */
  readonly cwd: string;
  /** The change to apply. */
  readonly change: EditChange;
}
