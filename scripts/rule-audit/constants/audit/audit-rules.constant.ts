export const AUDIT_RULES = [
  "nullable-union",
  "optional-chaining",
  "optional-property",
  "type-assertion",
  "function-comment",
  "plain-block-comment",
  "file-length",
  "fabricated-default",
  "definite-assignment",
  "mutable-array",
  "unchecked-default",
  "positional-parameters",
  "multi-export",
  "multi-interface-file",
  "banned-name",
  "missing-role-suffix",
  "duplicate-constant",
  "duplicate-function",
  "crowded-constants-folder",
] as const;

export const STALE_BOUNDARY_RULE = "stale-boundary";

export const MAX_FILE_LINES = 150;

export const MAX_POSITIONAL_PARAMETERS = 3;

export const MAX_CONSTANT_FILES_PER_FOLDER = 8;

export const TYPESCRIPT_EXTENSION = ".ts";

export const DECLARATION_FILE_SUFFIX = ".d.ts";

export const IGNORED_DIRECTORY_NAMES = ["node_modules", ".git"] as const;
