export const TASK_TOOL_DESCRIPTION = [
  "Run an isolated subagent with a mission, optional role, context, model, reasoning, tools, and skills.",
  "Explore and verify roles stay read-only, and implementation workers run one at a time.",
  "Reports progress and a structured result.",
].join(" ");

export const TASK_PROMPT_GUIDELINES = [
  "Use task for bounded independent work. Give it a short title and one specific mission.",
  "Choose explore, implement, or verify when the mission fits that role. Omit role to keep generic task behavior.",
  "Specify only the context, tools, and skills the subagent needs. It does not inherit this conversation.",
  "List exact verificationCommands for implement or verify workers that need to run checks.",
  "Call task multiple times in one response for independent work. Implement workers share one slot.",
];

export const TASK_TOOL_LABEL = "Subagent";
export const TASK_PROMPT_SNIPPET = "Delegate a bounded mission to a subagent with a selected role";
