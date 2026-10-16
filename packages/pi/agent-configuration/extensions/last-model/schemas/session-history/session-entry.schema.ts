import { Type } from "typebox";
import { ThinkingLevelSchema } from "../model-selection/thinking-level.schema.ts";

export const SessionEntryTypeSchema = Type.Object({
  type: Type.String({ description: "Entry kind recorded in the session file." }),
});

export const ModelChangeEntrySchema = Type.Object({
  provider: Type.String({ minLength: 1, description: "Provider identifier of the model selected." }),
  modelId: Type.String({ minLength: 1, description: "Model identifier selected in the session." }),
});

export const ThinkingLevelChangeEntrySchema = Type.Object({
  thinkingLevel: ThinkingLevelSchema,
});
