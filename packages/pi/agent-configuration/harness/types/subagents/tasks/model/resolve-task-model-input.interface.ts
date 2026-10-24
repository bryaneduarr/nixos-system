import type { ModelRuntime } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../../activity/value/value-state.interface.ts";
import type { TaskModel } from "./task-model.interface.ts";

/** Inputs that choose the model of a worker session. */
export interface ResolveTaskModelInput {
  /** Runtime that looks up provider models. */
  readonly runtime: ModelRuntime;
  /** Provider/model identifier requested by the task, when given. */
  readonly requestedModel: ValueState<string>;
  /** Model of the parent session, used when no model is requested. */
  readonly currentModel: ValueState<TaskModel>;
}
