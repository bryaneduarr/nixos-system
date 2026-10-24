import { NO_MODEL_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";

export function modelShortLabel(model: ValueState<SubagentModel>): string {
  if (model.state === "absent") return NO_MODEL_LABEL;
  if (model.value.name.state === "absent") return model.value.id;
  return model.value.name.value;
}
