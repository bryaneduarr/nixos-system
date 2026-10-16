export const NEWLINE = "\n";

export const BACKSLASH = "\\";

export const BACKTICK = "`";

export const SLASH = "/";

export const QUOTE_CHARACTERS: ReadonlySet<string> = new Set(["'", '"']);

export const CHARACTERS_BEFORE_REGEX: ReadonlySet<string> = new Set([
  "",
  "(",
  ",",
  "=",
  ":",
  "[",
  "!",
  "&",
  "|",
  "?",
  "{",
  "}",
  ";",
  "+",
  "-",
]);

export const WHITESPACE = /\s/;

export const NON_NEWLINE_CHARACTER = /[^\n]/g;
