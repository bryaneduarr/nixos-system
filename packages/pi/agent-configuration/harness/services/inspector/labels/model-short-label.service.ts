import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function modelShortLabel(model: SubagentModel | undefined): string {
  if (!model) return "model —";
  return presentValue(model.name) ?? model.id;
}
