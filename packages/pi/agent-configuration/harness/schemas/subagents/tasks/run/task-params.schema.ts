import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import { SUBAGENT_TOOLS, TASK_ROLES } from "../../../../constants/subagents/roles/roles.constant.ts";
import { REASONING_LEVELS } from "../../../../constants/subagents/tasks/model/reasoning.constant.ts";
import {
  TASK_TIMEOUT_MAX_MS,
  TASK_TIMEOUT_MIN_MS,
  TASK_TITLE_MAX_LENGTH,
} from "../../../../constants/subagents/tasks/run/task-limit.constant.ts";

export const TaskParams = Type.Object({
  /** Label shown for the worker in the conversation and status list. */
  title: Type.String({
    minLength: 1,
    maxLength: TASK_TITLE_MAX_LENGTH,
    description: "Short title shown in the conversation.",
  }),
  /** Instruction the isolated worker carries out. */
  mission: Type.String({
    minLength: 1,
    description: "One concrete mission for this isolated worker.",
  }),
  /** Role that selects the worker's instructions and default tools. */
  role: Type.Optional(
    StringEnum(TASK_ROLES, {
      description: "Worker role. Defaults to the legacy generic task behavior when omitted.",
    }),
  ),
  /** Background the worker needs; the parent transcript is never inherited. */
  context: Type.Optional(
    Type.String({
      description: "Only the background needed for this mission. No parent transcript is inherited.",
    }),
  ),
  /** Provider and model identifier for the worker. */
  model: Type.Optional(
    Type.String({
      description: "Optional provider/model ID. Defaults to the current model.",
    }),
  ),
  /** Reasoning level for the worker. */
  reasoning: Type.Optional(
    StringEnum(REASONING_LEVELS, {
      description: "Optional reasoning level. Defaults to the current level.",
    }),
  ),
  /** Tools the worker may call. */
  tools: Type.Optional(
    Type.Array(
      StringEnum(SUBAGENT_TOOLS, {
        description: "Exact tools this worker may call. The selected role can reject incompatible tools.",
      }),
      {
        uniqueItems: true,
        description: "Defaults to the selected role's tool set.",
      },
    ),
  ),
  /** Shell commands the worker may run through the approved command tool. */
  verificationCommands: Type.Optional(
    Type.Array(Type.String({ minLength: 1 }), {
      uniqueItems: true,
      description: "Exact shell commands approved for implement or verify workers.",
    }),
  ),
  /** Discoverable skills the worker may read. */
  skills: Type.Optional(
    Type.Array(Type.String(), {
      uniqueItems: true,
      description: "Names of discoverable skills this worker may read. Defaults to none.",
    }),
  ),
  /** Maximum runtime of the worker before it is aborted. */
  timeoutMs: Type.Optional(
    Type.Integer({
      minimum: TASK_TIMEOUT_MIN_MS,
      maximum: TASK_TIMEOUT_MAX_MS,
      description: "Maximum runtime in milliseconds.",
    }),
  ),
});
