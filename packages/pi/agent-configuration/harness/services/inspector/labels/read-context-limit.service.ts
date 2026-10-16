import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function readContextLimit(model: ValueState<SubagentModel>): ValueState<number> {
  const subagentModel = presentValue(model);
  const contextWindow = subagentModel === undefined ? undefined : presentValue(subagentModel.contextWindow);
  return contextWindow !== undefined && contextWindow > 0
    ? { state: "present", value: contextWindow }
    : { state: "absent" };
}
