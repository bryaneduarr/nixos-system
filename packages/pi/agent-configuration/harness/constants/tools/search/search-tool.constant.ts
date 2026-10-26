export const SEARCH_TOOL_LABEL = "Search";

export const SEARCH_TOOL_DESCRIPTION = [
  "Find filenames, text, symbols, definitions, references, tests, structural matches, or git history.",
  "Returns a small, classified result with omitted counts.",
  "Text queries are regular expressions; invalid patterns fall back to literal matching.",
].join(" ");

export const SEARCH_TOOL_PROMPT_SNIPPET = "Locate files, symbols, references, and tests with bounded output";

export const SEARCH_TOOL_GUIDELINES = [
  "Use search to locate relevant files, symbols, references, and tests before reading or editing.",
] as const;
