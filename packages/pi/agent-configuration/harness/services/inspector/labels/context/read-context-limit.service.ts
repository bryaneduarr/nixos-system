import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";

export function readContextLimit(model: ValueState<SubagentModel>): ValueState<number> {
  if (model.state === "absent" || model.value.contextWindow.state === "absent") return { state: "absent" };
  const contextWindow = model.value.contextWindow.value;
  return contextWindow > 0 ? { state: "present", value: contextWindow } : { state: "absent" };
}
