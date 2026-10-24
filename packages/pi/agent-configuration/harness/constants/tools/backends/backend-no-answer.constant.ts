// Engines report empty searches and their own failures as ordinary text, not as tool errors.
export const BACKEND_NO_ANSWER_PATTERNS = [
  /^No (matches|files|symbols|definition|callers|callees)\b/,
  /^No LSP (workspace symbols|\w+ locations)\b/,
  /^\w+ failed: /,
] as const;
