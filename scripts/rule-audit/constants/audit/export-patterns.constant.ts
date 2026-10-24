export const EXPORTED_DECLARATION_PATTERN = /^export\s+(async\s+)?(function|const|let|class|interface|type|enum)\b/;

export const EXPORTED_INTERFACE_PATTERN = /^export\s+interface\b/;

export const TOP_LEVEL_FUNCTION_PATTERN =
  /^(?:export\s+)?(?:async\s+)?function\s+(\w+)|^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|\w+)\s*(?::\s*[^=]+)?=>/;

export const EXPORTED_CONSTANT_PATTERN = /^export const (\w+)(?::\s*[^=]+)? = ("[^"\n]*"|'[^'\n]*'|\d[\d_.]*);/;

export const MIN_DUPLICATE_TEXT_LENGTH = 2;
