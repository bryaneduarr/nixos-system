export const LEGACY_SYSTEM_PROMPT = [
  "You are an isolated subagent.",
  "Complete the assigned mission and report only verified results.",
  "Use only your available tools and skills.",
  "End with status, summary, findings, files_changed, and errors sections.",
].join(" ");

export const RESULT_FORMAT_INSTRUCTION = [
  "End with status, summary, findings, unresolved_questions, checks, files_changed, risks, and errors sections.",
  "Use an empty value when a section has no items.",
].join(" ");

export const NO_VERIFICATION_COMMANDS_INSTRUCTION = "No verification commands are approved. Do not run shell commands.";

export const ROLE_TOOL_INSTRUCTION =
  "Use only your available tools and skills. Do not infer permission from the mission.";

export const ROLE_SYSTEM_PROMPT_PREFIX = "You are an isolated subagent assigned the";
