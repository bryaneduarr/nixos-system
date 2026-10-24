import type {
  PromptCollectionName,
  PromptCollections,
} from "../../../types/prompts/view/prompt-collections.interface.ts";
import { summarizePrompt } from "./summarize-prompt.service.ts";

export function summarizeCollections(collections: PromptCollections): Readonly<Record<PromptCollectionName, string[]>> {
  return {
    prompts: collections.prompts.map(summarizePrompt),
    outputs: collections.outputs.map(summarizePrompt),
  };
}
