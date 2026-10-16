export const AUDIT_RULES = [
  "nullable-union",
  "optional-chaining",
  "optional-property",
  "type-assertion",
  "function-comment",
  "plain-block-comment",
  "file-length",
] as const;

export const STALE_BOUNDARY_RULE = "stale-boundary";

export const MAX_FILE_LINES = 150;

export const TYPESCRIPT_EXTENSION = ".ts";

export const DECLARATION_FILE_SUFFIX = ".d.ts";

export const IGNORED_DIRECTORY_NAMES = ["node_modules", ".git"] as const;
