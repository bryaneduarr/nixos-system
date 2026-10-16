/* Part of the source the scanner is currently inside. */
export type ScanMode = "code" | "line-comment" | "block-comment" | "quoted" | "template" | "regex";

/* Mutable progress of one scan over a source file. */
export interface ScanState {
  /* Part of the source the scanner is inside. */
  mode: ScanMode;
  /* Quote character that opened the current string, or an empty string outside strings. */
  quote: string;
  /* Number of open braces in code. */
  braceDepth: number;
  /* Last non-space character written as code, used to tell a regex from a division. */
  previousCodeCharacter: string;
  /* Whether the scanner is inside a regex character class, where a slash does not end the regex. */
  inCharacterClass: boolean;
  /* Brace depths at which each open template expression started, innermost last. */
  readonly templateExpressionDepths: number[];
}

/* What one scanning step writes and how many characters it consumed. */
export interface ScanStep {
  /* Text written in place of the consumed characters. */
  readonly replacement: string;
  /* Number of source characters consumed. */
  readonly consumed: number;
}
