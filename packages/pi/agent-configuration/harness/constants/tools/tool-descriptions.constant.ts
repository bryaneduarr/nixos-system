export const SEARCH_TOOL_DESCRIPTION = [
  "Find filenames, text, symbols, definitions, references, tests, structural matches, or git history.",
  "Returns a small, classified result with omitted counts.",
].join(" ");

export const READ_TOOL_DESCRIPTION = [
  "Read a bounded slice of a source file by path, line range, or symbol.",
  "Large broad reads return structure and symbols instead of the whole file.",
].join(" ");

export const EDIT_TOOL_DESCRIPTION = [
  "Modify files with precise patches.",
  "Supports exact replacements, file creation, deletion, and moves.",
  "Returns a compact name and diff summary instead of the whole file.",
].join(" ");

export const RUN_TOOL_DESCRIPTION = [
  "Run a shell command when no specialized tool covers the operation.",
  "Captures exit code, compresses large output, and stores the full output under .agent/runs.",
].join(" ");
