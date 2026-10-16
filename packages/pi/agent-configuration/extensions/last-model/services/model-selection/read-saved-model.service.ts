import { readFileSync } from "node:fs";
import { Value } from "typebox/value";
import { MODEL_STATE_FILE } from "../../constants/model-selection/state-file.constant.ts";
import { UNCHOSEN_THINKING } from "../../constants/model-selection/unchosen-thinking.constant.ts";
import { SavedModelFileSchema } from "../../schemas/model-selection/saved-model-file.schema.ts";
import { ThinkingLevelSchema } from "../../schemas/model-selection/thinking-level.schema.ts";
import type { ModelSelectionLookup, ThinkingChoice } from "../../types/model-selection/model-selection.interface.ts";

function thinkingChoiceFrom(value: unknown): ThinkingChoice {
  return Value.Check(ThinkingLevelSchema, value) ? { state: "chosen", level: value } : UNCHOSEN_THINKING;
}

function savedModelFromFile(value: unknown): ModelSelectionLookup {
  if (!Value.Check(SavedModelFileSchema, value)) return { found: false };
  const thinkingValue = "thinkingLevel" in value ? value.thinkingLevel : undefined;
  return {
    found: true,
    selection: { provider: value.provider, id: value.id, thinking: thinkingChoiceFrom(thinkingValue) },
  };
}

export function readSavedModel(): ModelSelectionLookup {
  try {
    const value: unknown = JSON.parse(readFileSync(MODEL_STATE_FILE, "utf8"));
    return savedModelFromFile(value);
  } catch {
    return { found: false };
  }
}
