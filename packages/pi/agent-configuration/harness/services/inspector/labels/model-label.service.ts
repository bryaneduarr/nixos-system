import { NO_MODEL_LABEL } from "../../../constants/inspector/label.constant.ts";
import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function modelLabel(model: ValueState<SubagentModel>): string {
  const subagentModel = presentValue(model);
  if (subagentModel === undefined) return NO_MODEL_LABEL;
  const qualified = `${subagentModel.provider}/${subagentModel.id}`;
  const name = presentValue(subagentModel.name);
  return name && name !== subagentModel.id ? `${name} (${qualified})` : qualified;
}
