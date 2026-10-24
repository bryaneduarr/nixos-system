export const READ_TOOL_LABEL = "Read";

export const READ_TOOL_DESCRIPTION = [
  "Read a bounded slice of a source file by path, line range, or symbol.",
  "Large broad reads return structure and symbols instead of the whole file.",
].join(" ");

export const READ_TOOL_PROMPT_SNIPPET = "Read only the source needed for the current problem";

export const READ_TOOL_GUIDELINES = [
  "Use read for the source required to understand the problem; it bounds large files automatically.",
] as const;
