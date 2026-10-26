// claude-bridge refuses system prompts that do not embed a prompt recorded from the parent session.
export const PARENT_PROMPT_PROVIDERS = ["claude-bridge"] as const;

export const SUBAGENT_PROMPT_HEADING =
  "# Subagent instructions\n\nYou are now a subagent. The instructions below replace the parent's task, tools, and response style.";
