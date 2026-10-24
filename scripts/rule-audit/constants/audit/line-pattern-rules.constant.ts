import type { LinePatternRule } from "../../types/audit/line-pattern-rule.interface.ts";

const ANY_TYPESCRIPT_FILE = /\.ts$/;
const INTERFACE_FILE = /\.interface\.ts$/;
const EMPTY_VALUE = String.raw`(""|''|\`\`|0(?![\w.]))`;

export const LINE_PATTERN_RULES: readonly LinePatternRule[] = [
  {
    rule: "nullable-union",
    pattern: /(?<!\|)\|(?!\|)\s*(undefined|null)\b|\b(undefined|null)\s*\|(?!\|)/,
    appliesInModuleClause: true,
    filePattern: ANY_TYPESCRIPT_FILE,
  },
  { rule: "optional-chaining", pattern: /\?\.(?!\d)/, appliesInModuleClause: true, filePattern: ANY_TYPESCRIPT_FILE },
  { rule: "optional-property", pattern: /[\w\]]\?\s*:/, appliesInModuleClause: true, filePattern: ANY_TYPESCRIPT_FILE },
  {
    rule: "type-assertion",
    pattern: /[\w)\]}]\s+as\s+(?!const\b)[\w{([<"'`]/,
    appliesInModuleClause: false,
    filePattern: ANY_TYPESCRIPT_FILE,
  },
  {
    rule: "fabricated-default",
    pattern: new RegExp(
      [
        String.raw`(\?\?|\|\|)\s*${EMPTY_VALUE}`,
        String.raw`(===|==)\s*(undefined|null)\s*\?\s*${EMPTY_VALUE}\s*:`,
        String.raw`(!==|!=)\s*(undefined|null)\s*\?[^:]*:\s*${EMPTY_VALUE}`,
        String.raw`\[\s*\w+\s*=\s*${EMPTY_VALUE}\s*\]`,
      ].join("|"),
    ),
    appliesInModuleClause: false,
    filePattern: ANY_TYPESCRIPT_FILE,
  },
  {
    rule: "definite-assignment",
    pattern: /\b\w+!\s*:/,
    appliesInModuleClause: false,
    filePattern: ANY_TYPESCRIPT_FILE,
  },
  {
    rule: "mutable-array",
    pattern: /^\s*(readonly\s+)?\w+:\s+(?!readonly\b)\S.*\[\];\s*$|^export type \w+ = (?!readonly\b)[^|&]*\[\];/,
    appliesInModuleClause: false,
    filePattern: INTERFACE_FILE,
  },
];

export const FUNCTION_DECLARATION_PATTERNS: readonly RegExp[] = [
  /^\s*(export\s+)?(default\s+)?(async\s+)?function\b/,
  /^\s*(export\s+)?const\s+\w+\s*=\s*(async\s+)?(\([^)]*\)|\w+)\s*(:\s*[^=]+)?=>/,
];

export const COMMENT_END_PATTERN = /(\*\/|^\s*\/\/.*)\s*$/;

export const PLAIN_BLOCK_COMMENT_PATTERN = /^\s*\/\*(?!\*)/;
