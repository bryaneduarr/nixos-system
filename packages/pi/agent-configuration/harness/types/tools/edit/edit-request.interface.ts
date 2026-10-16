/* A file change requested by the edit tool. */
export interface EditRequest {
  /* Directory relative paths resolve against. */
  readonly cwd: string;
  /* The change to apply. */
  readonly change: EditChange;
}

/* One file operation the edit tool performs. */
type EditChange = ReplaceChange | CreateChange | DeleteChange | MoveChange;

/* Exact text replacements applied to an existing file. */
export interface ReplaceChange {
  /* Marks a replacement. */
  readonly op: "replace";
  /* Target file as the caller wrote it. */
  readonly path: string;
  /* Replacements applied in order; empty when the caller gave none. */
  readonly edits: readonly TextEdit[];
  /* Whether every occurrence of each oldText is replaced. */
  readonly replaceAll: boolean;
}

/* Writes a new file. */
export interface CreateChange {
  /* Marks a file creation. */
  readonly op: "create";
  /* Target file as the caller wrote it. */
  readonly path: string;
  /* Contents of the new file. */
  readonly content: string;
  /* Whether an existing file may be replaced. */
  readonly overwrite: boolean;
}

/* Removes a file. */
export interface DeleteChange {
  /* Marks a deletion. */
  readonly op: "delete";
  /* Target file as the caller wrote it. */
  readonly path: string;
}

/* Renames or relocates a file. */
export interface MoveChange {
  /* Marks a move. */
  readonly op: "move";
  /* Source file as the caller wrote it. */
  readonly path: string;
  /* Destination path as the caller wrote it. */
  readonly destination: string;
  /* Whether an existing destination may be replaced. */
  readonly overwrite: boolean;
}

/* One exact text replacement. */
export interface TextEdit {
  /* Exact text to find. */
  readonly oldText: string;
  /* Text that replaces it. */
  readonly newText: string;
}

/* Result of converting edit parameters into a request. */
export type EditRequestValidation = ValidEditRequest | InvalidEditRequest;

/* An edit request that can run. */
interface ValidEditRequest {
  /* Marks a usable request. */
  readonly valid: true;
  /* The converted request. */
  readonly request: EditRequest;
}

/* Edit parameters that cannot form a request. */
interface InvalidEditRequest {
  /* Marks an unusable request. */
  readonly valid: false;
  /* Message to return to the model. */
  readonly summary: string;
}
