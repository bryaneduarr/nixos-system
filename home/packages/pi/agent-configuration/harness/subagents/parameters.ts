import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import { SUBAGENT_TOOLS, TASK_ROLES } from "./roles.ts";

const REASONING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh"] as const;

export const TaskParams = Type.Object({
  title: Type.String({
    minLength: 1,
    maxLength: 100,
    description: "Short title shown in the conversation.",
  }),
  mission: Type.String({
    minLength: 1,
    description: "One concrete mission for this isolated worker.",
  }),
  role: Type.Optional(StringEnum(TASK_ROLES, {
    description: "Worker role. Defaults to the legacy generic task behavior when omitted.",
  })),
  context: Type.Optional(Type.String({
    description: "Only the background needed for this mission. No parent transcript is inherited.",
  })),
  model: Type.Optional(Type.String({
    description: "Optional provider/model ID. Defaults to the current model.",
  })),
  reasoning: Type.Optional(StringEnum(REASONING_LEVELS, {
    description: "Optional reasoning level. Defaults to the current level.",
  })),
  tools: Type.Optional(Type.Array(
    StringEnum(SUBAGENT_TOOLS, {
      description: "Exact tools this worker may call. The selected role can reject incompatible tools.",
    }),
    {
      uniqueItems: true,
      description: "Defaults to the selected role's tool set.",
    },
  )),
  verificationCommands: Type.Optional(Type.Array(
    Type.String({ minLength: 1 }),
    {
      uniqueItems: true,
      description: "Exact shell commands approved for implement or verify workers.",
    },
  )),
  skills: Type.Optional(Type.Array(
    Type.String(),
    {
      uniqueItems: true,
      description: "Names of discoverable skills this worker may read. Defaults to none.",
    },
  )),
  timeoutMs: Type.Optional(Type.Integer({
    minimum: 1000,
    maximum: 3600000,
    description: "Maximum runtime in milliseconds.",
  })),
});
