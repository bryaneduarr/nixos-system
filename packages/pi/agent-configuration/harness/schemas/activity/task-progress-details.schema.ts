import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import { TASK_ROLES } from "../../constants/subagents/roles.constant.ts";

export const TaskProgressDetailsSchema = Type.Object({
  /* Identifier of the subagent run. */
  id: Type.String(),
  /* Title the parent gave the task. */
  title: Type.String(),
  /* Role the worker runs with. */
  role: StringEnum(TASK_ROLES),
  /* Tools the worker may call. */
  tools: Type.Array(Type.String()),
  /* Approved verification commands for the worker. */
  verificationCommands: Type.Array(Type.String()),
  /* Description of the step the worker is on. */
  currentTask: Type.String(),
  /* Lifecycle state of the run. */
  status: Type.Union([
    Type.Literal("running"),
    Type.Literal("success"),
    Type.Literal("error"),
    Type.Literal("cancelled"),
  ]),
  /* Model metadata, validated when it is converted. */
  model: Type.Optional(Type.Unknown()),
  /* Reasoning level, validated when it is converted. */
  thinkingLevel: Type.Optional(Type.Unknown()),
  /* Usage totals, validated when they are converted. */
  usage: Type.Optional(Type.Unknown()),
});
