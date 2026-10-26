export const EDIT_TOOL_LABEL = "Edit";

export const EDIT_TOOL_DESCRIPTION = [
  "Modify files with precise patches.",
  "Supports exact replacements, file creation, deletion, and moves.",
  "Returns a compact name and diff summary instead of the whole file.",
].join(" ");

export const EDIT_TOOL_PROMPT_SNIPPET = "Apply precise file edits and report a compact diff";

export const EDIT_TOOL_GUIDELINES = [
  "Use edit for code changes; prefer exact-text replacements over rewriting whole files.",
] as const;
