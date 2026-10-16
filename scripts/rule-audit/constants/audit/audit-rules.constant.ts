export const AUDIT_RULES = [
  "nullable-union",
  "optional-chaining",
  "optional-property",
  "type-assertion",
  "function-comment",
  "file-length",
] as const;

export const STALE_BOUNDARY_RULE = "stale-boundary";

export const MAX_FILE_LINES = 150;

export const BOUNDARIES_FILE_NAME = "rule-audit-boundaries.json";

export const TYPESCRIPT_EXTENSION = ".ts";

export const DECLARATION_FILE_SUFFIX = ".d.ts";

export const IGNORED_DIRECTORY_NAMES = ["node_modules", ".git"] as const;
