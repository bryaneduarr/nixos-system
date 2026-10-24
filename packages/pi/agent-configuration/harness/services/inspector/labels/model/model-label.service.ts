import { NO_MODEL_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";

export function modelLabel(model: ValueState<SubagentModel>): string {
  if (model.state === "absent") return NO_MODEL_LABEL;
  const { provider, id, name } = model.value;
  const qualified = `${provider}/${id}`;
  if (name.state === "absent" || name.value === "" || name.value === id) return qualified;
  return `${name.value} (${qualified})`;
}
