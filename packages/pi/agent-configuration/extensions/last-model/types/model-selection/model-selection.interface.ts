import type { Static } from "typebox";
import type { ThinkingLevelSchema } from "../../schemas/model-selection/thinking-level.schema.ts";

/** Thinking level Pi applies to a model. */
type ThinkingLevel = Static<typeof ThinkingLevelSchema>;

/** Whether a saved model selection also records a thinking level. */
export type ThinkingChoice =
  | { readonly state: "chosen"; readonly level: ThinkingLevel }
  | { readonly state: "unchosen" };

/** A model the user selected, with the thinking level chosen for it. */
export interface ModelSelection {
  /** Provider identifier of the selected model. */
  readonly provider: string;
  /** Model identifier within the provider. */
  readonly id: string;
  /** Thinking level saved with the model. */
  readonly thinking: ThinkingChoice;
}

/** Result of looking up a saved model selection. */
export type ModelSelectionLookup =
  | { readonly found: true; readonly selection: ModelSelection }
  | { readonly found: false };
