import type { PromptCollectionName } from "../../types/prompts/view/prompt-collections.interface.ts";

/** Key that shows each list of the prompt browser. */
export const COLLECTION_BY_KEY: Readonly<Record<string, PromptCollectionName>> = { "1": "prompts", "2": "outputs" };
/** Title and footer link name of each list of the prompt browser. */
export const COLLECTION_LABEL: Readonly<Record<PromptCollectionName, string>> = {
  prompts: "Prompts",
  outputs: "Outputs",
};
/** Text shown in place of an empty list. */
export const COLLECTION_EMPTY_TEXT: Readonly<Record<PromptCollectionName, string>> = {
  prompts: "  No prompts or draft yet.",
  outputs: "  No agent outputs yet.",
};
/** Key hints shown in the header of the prompt browser. */
export const PROMPT_BROWSER_KEY_HINT = "Tab focus  hjkl wb 0 $ gg G move  v V select  y yy copy  Esc close";
/** Key hint of the browser that chooses the turn the transcript shows. */
export const TURN_BROWSER_KEY_HINT = `Enter show turn  ${PROMPT_BROWSER_KEY_HINT}`;
