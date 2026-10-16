export const RULE_MESSAGES = {
  "nullable-union": "Union with undefined or null; model absence with a discriminated union.",
  "optional-chaining": "Optional chaining; narrow the value explicitly.",
  "optional-property": "Optional property or parameter; make it required or use a union.",
  "type-assertion": "Type assertion other than `as const`; correct the type or narrow it.",
  "function-comment": "Comment above a function; the name and signature describe it.",
  "file-length": "File is longer than the line limit; split it by responsibility.",
  "plain-block-comment": "Plain block comment; use a JSDoc /** */ comment.",
  "stale-boundary": "Exception matches no finding; remove its row from the rule file.",
} as const;
