import type { ResolveTaskModelInput } from "../../../types/subagents/tasks/resolve-task-model-input.interface.ts";
import type { TaskModel } from "../../../types/subagents/tasks/task-model.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

function resolveRequestedModel(input: ResolveTaskModelInput, requestedModel: string): TaskModel | undefined {
  const [provider = "", ...modelParts] = requestedModel.split("/");
  return input.runtime.getModel(provider, modelParts.join("/"));
}

export function resolveTaskModel(input: ResolveTaskModelInput): TaskModel {
  const requestedModel = presentValue(input.requestedModel);
  const isModelRequested = requestedModel !== undefined && requestedModel !== "";
  const model = isModelRequested ? resolveRequestedModel(input, requestedModel) : presentValue(input.currentModel);

  if (!model) {
    throw new Error(`Unknown model: ${requestedModel ?? "current model"}`);
  }

  return model;
}
