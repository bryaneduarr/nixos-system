import type { ModelRuntime } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import type { ResolveTaskModelInput } from "../../../types/subagents/tasks/resolve-task-model-input.interface.ts";
import type { TaskModel } from "../../../types/subagents/tasks/task-model.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

function requestedModelOrThrow(runtime: ModelRuntime, requestedModel: string): TaskModel {
  const [provider = "", ...modelParts] = requestedModel.split("/");
  const model = runtime.getModel(provider, modelParts.join("/"));
  if (!model) throw new Error(`Unknown model: ${requestedModel}`);

  return model;
}

function currentModelOrThrow(currentModel: ValueState<TaskModel>): TaskModel {
  const model = presentValue(currentModel);
  if (!model) throw new Error("Unknown model: current model");

  return model;
}

export function resolveTaskModel(input: ResolveTaskModelInput): TaskModel {
  const requestedModel = presentValue(input.requestedModel);
  if (requestedModel === undefined || requestedModel === "") return currentModelOrThrow(input.currentModel);

  return requestedModelOrThrow(input.runtime, requestedModel);
}
