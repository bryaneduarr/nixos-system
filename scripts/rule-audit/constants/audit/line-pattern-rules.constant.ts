import type { LinePatternRule } from "../../types/audit/line-pattern-rule.interface.ts";

export const LINE_PATTERN_RULES: readonly LinePatternRule[] = [
  {
    rule: "nullable-union",
    pattern: /\|\s*(undefined|null)\b|\b(undefined|null)\s*\|/,
    appliesInModuleClause: true,
  },
  { rule: "optional-chaining", pattern: /\?\.(?!\d)/, appliesInModuleClause: true },
  { rule: "optional-property", pattern: /[\w\]]\?\s*:/, appliesInModuleClause: true },
  { rule: "type-assertion", pattern: /[\w)\]}]\s+as\s+(?!const\b)[\w{([<"'`]/, appliesInModuleClause: false },
];

export const FUNCTION_DECLARATION_PATTERNS: readonly RegExp[] = [
  /^\s*(export\s+)?(default\s+)?(async\s+)?function\b/,
  /^\s*(export\s+)?const\s+\w+\s*=\s*(async\s+)?(\([^)]*\)|\w+)\s*(:\s*[^=]+)?=>/,
];

export const COMMENT_END_PATTERN = /(\*\/|^\s*\/\/.*)\s*$/;
