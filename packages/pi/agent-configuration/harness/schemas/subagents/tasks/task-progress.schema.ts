import { StringEnum } from "@earendil-works/pi-ai";
import { type TSchema, Type } from "typebox";
import { TASK_ROLES } from "../../../constants/subagents/roles.constant.ts";

function valueStateSchema<T extends TSchema>(valueSchema: T) {
  return Type.Union([
    Type.Object({ state: Type.Literal("present"), value: valueSchema }),
    Type.Object({ state: Type.Literal("absent") }),
  ]);
}

const SubagentModelSchema = Type.Object({
  provider: Type.String(),
  id: Type.String(),
  name: valueStateSchema(Type.String()),
  reasoning: valueStateSchema(Type.Boolean()),
  contextWindow: valueStateSchema(Type.Number()),
});

const SubagentUsageSchema = Type.Object({
  inputTokens: Type.Number(),
  outputTokens: Type.Number(),
  cacheReadTokens: Type.Number(),
  cacheWriteTokens: Type.Number(),
  reasoningTokens: Type.Number(),
  totalTokens: Type.Number(),
  contextTokens: valueStateSchema(Type.Number()),
  maxContextTokens: valueStateSchema(Type.Number()),
});

const ToolActivityUsageSchema = Type.Union([
  Type.Object({ usageState: Type.Literal("reported"), usage: SubagentUsageSchema }),
  Type.Object({ usageState: Type.Literal("unreported") }),
]);

const SubToolActivitySchema = Type.Object({
  id: Type.String(),
  toolName: Type.String(),
  args: Type.Record(Type.String(), Type.Unknown()),
  status: Type.Union([Type.Literal("running"), Type.Literal("success"), Type.Literal("error")]),
  text: Type.String(),
  startedAt: Type.Number(),
  endedAt: valueStateSchema(Type.Number()),
});

export const TaskProgressSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  role: StringEnum(TASK_ROLES),
  tools: Type.Array(Type.String()),
  verificationCommands: Type.Array(Type.String()),
  currentTask: Type.String(),
  status: Type.Union([
    Type.Literal("running"),
    Type.Literal("success"),
    Type.Literal("error"),
    Type.Literal("cancelled"),
  ]),
  model: valueStateSchema(SubagentModelSchema),
  thinkingLevel: valueStateSchema(Type.String()),
  activity: Type.Array(SubToolActivitySchema),
  usage: ToolActivityUsageSchema,
});
