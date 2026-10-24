import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { TaskModel } from "../../../../types/subagents/tasks/model/task-model.interface.ts";
import { toValueState } from "../../../activity/value/to-value-state.service.ts";

export function describeTaskModel(model: TaskModel): SubagentModel {
  return {
    provider: model.provider,
    id: model.id,
    name: toValueState(model.name),
    reasoning: toValueState(model.reasoning),
    contextWindow: toValueState(model.contextWindow),
  };
}
