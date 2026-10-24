import {
  PARENT_PROMPT_PROVIDERS,
  SUBAGENT_PROMPT_HEADING,
} from "../../../constants/subagents/prompt-inheritance.constant.ts";
import type { ComposeTaskSystemPromptInput } from "../../../types/subagents/tasks/compose-task-system-prompt-input.interface.ts";

export function composeTaskSystemPrompt(input: ComposeTaskSystemPromptInput): string {
  const needsParentPrompt = PARENT_PROMPT_PROVIDERS.some((provider) => provider === input.provider);
  if (!needsParentPrompt) return input.rolePrompt;

  return `${input.parentPrompt}\n\n${SUBAGENT_PROMPT_HEADING}\n\n${input.rolePrompt}`;
}
