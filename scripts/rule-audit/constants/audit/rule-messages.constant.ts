export const RULE_MESSAGES = {
  "nullable-union": "Union with undefined or null; model absence with a discriminated union.",
  "optional-chaining": "Optional chaining; narrow the value explicitly.",
  "optional-property": "Optional property or parameter; make it required or use a union.",
  "type-assertion": "Type assertion other than `as const`; correct the type or narrow it.",
  "function-comment": "Comment above a function; the name and signature describe it.",
  "file-length": "File is longer than the line limit; split it by responsibility.",
  "stale-boundary": "Boundary entry matches no finding; remove it from the allowlist.",
} as const;
