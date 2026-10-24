import type { PromptItem } from "../collection/prompt-item.interface.ts";

/** List the prompt browser shows: the user's prompts or the agent's outputs. */
export type PromptCollectionName = "prompts" | "outputs";

/** Items of every list the prompt browser can show. */
export interface PromptCollections {
  /** User prompts and the unsent draft, newest first. */
  readonly prompts: readonly PromptItem[];
  /** Text the agent replied with, newest first. */
  readonly outputs: readonly PromptItem[];
}
