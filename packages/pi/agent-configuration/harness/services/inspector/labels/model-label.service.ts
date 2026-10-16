import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function modelLabel(model: SubagentModel | undefined): string {
  if (!model) return "model —";
  const qualified = `${model.provider}/${model.id}`;
  const name = presentValue(model.name);
  return name && name !== model.id ? `${name} (${qualified})` : qualified;
}
