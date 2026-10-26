/** Wrapped lines of a sent prompt that the transcript shows before truncating it. */
export const PREVIEW_LINES = 3;
/** Characters of a sent prompt that are read when building its preview. */
export const PREVIEW_SOURCE_LIMIT = 2000;
/** Columns the transcript keeps free beside a prompt preview. */
export const PREVIEW_RESERVED_COLUMNS = 4;
/** Fewest backticks in the fence that keeps a preview containing Markdown syntax from being formatted. */
export const MIN_FENCE_LENGTH = 3;
/** Preview line content that Markdown would format instead of showing as typed. */
export const MARKDOWN_SYNTAX_PATTERN = /[`*_~#>|<$\\[\]]|^\s*(?:[-+=]|\d+[.)])/;
