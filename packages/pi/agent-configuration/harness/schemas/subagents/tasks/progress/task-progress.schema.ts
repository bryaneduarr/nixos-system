import { StringEnum } from "@earendil-works/pi-ai";
import { type TSchema, Type } from "typebox";
import { TASK_ROLES } from "../../../../constants/subagents/roles/roles.constant.ts";

function valueStateSchema<T extends TSchema>(valueSchema: T) {
  return Type.Union([
    Type.Object({ state: Type.Literal("present"), value: valueSchema }),
    Type.Object({ state: Type.Literal("absent") }),
  ]);
}

const SubagentModelSchema = Type.Object({
  /** Provider that serves the model. */
  provider: Type.String(),
  /** Model identifier within the provider. */
  id: Type.String(),
  /** Human-readable model name. */
  name: valueStateSchema(Type.String()),
  /** Whether the model supports reasoning. */
  reasoning: valueStateSchema(Type.Boolean()),
  /** Context window size of the model in tokens. */
  contextWindow: valueStateSchema(Type.Number()),
});

const SubagentUsageSchema = Type.Object({
  /** Input tokens summed over the run. */
  inputTokens: Type.Number(),
  /** Output tokens summed over the run. */
  outputTokens: Type.Number(),
  /** Cache-read tokens summed over the run. */
  cacheReadTokens: Type.Number(),
  /** Cache-write tokens summed over the run. */
  cacheWriteTokens: Type.Number(),
  /** Reasoning tokens summed over the run. */
  reasoningTokens: Type.Number(),
  /** Total tokens of the run. */
  totalTokens: Type.Number(),
  /** Tokens in the context of the last response, when known. */
  contextTokens: valueStateSchema(Type.Number()),
  /** Largest context window of the model, when known. */
  maxContextTokens: valueStateSchema(Type.Number()),
});

const ToolActivityUsageSchema = Type.Union([
  /** Usage the worker reported. */
  Type.Object({ usageState: Type.Literal("reported"), usage: SubagentUsageSchema }),
  /** No usage reported yet. */
  Type.Object({ usageState: Type.Literal("unreported") }),
]);

const SubToolActivitySchema = Type.Object({
  /** Identifier of the tool call. */
  id: Type.String(),
  /** Name of the tool that ran. */
  toolName: Type.String(),
  /** Arguments the tool was called with. */
  args: Type.Record(Type.String(), Type.Unknown()),
  /** Lifecycle state of the call. */
  status: Type.Union([Type.Literal("running"), Type.Literal("success"), Type.Literal("error")]),
  /** Bounded, model-visible result text for this tool call. */
  text: Type.String(),
  /** Time the call started, in milliseconds since the epoch. */
  startedAt: Type.Number(),
  /** Time the call ended, once it has ended. */
  endedAt: valueStateSchema(Type.Number()),
});

export const TaskProgressSchema = Type.Object({
  /** Identifier of the subagent run. */
  id: Type.String(),
  /** Title the parent gave the task. */
  title: Type.String(),
  /** Role the worker runs with. */
  role: StringEnum(TASK_ROLES),
  /** Tools the worker may call. */
  tools: Type.Array(Type.String()),
  /** Approved verification commands for the worker. */
  verificationCommands: Type.Array(Type.String()),
  /** Description of the step the worker is on. */
  currentTask: Type.String(),
  /** Lifecycle state of the run. */
  status: Type.Union([
    Type.Literal("running"),
    Type.Literal("success"),
    Type.Literal("error"),
    Type.Literal("cancelled"),
  ]),
  /** Model the worker runs on, once it has been resolved. */
  model: valueStateSchema(SubagentModelSchema),
  /** Reasoning level the worker runs with, once it has been resolved. */
  thinkingLevel: valueStateSchema(Type.String()),
  /** Tool calls the worker has made. */
  activity: Type.Array(SubToolActivitySchema),
  /** Token usage of the worker, present once it has produced a response. */
  usage: ToolActivityUsageSchema,
});
