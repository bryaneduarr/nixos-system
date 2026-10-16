import { NO_MODEL_LABEL } from "../../../constants/inspector/label.constant.ts";
import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";

export function modelShortLabel(model: ValueState<SubagentModel>): string {
  if (model.state === "absent") return NO_MODEL_LABEL;
  if (model.value.name.state === "absent") return model.value.id;
  return model.value.name.value;
}
