import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function readContextLimit(model: SubagentModel | undefined): number | undefined {
  const window = model === undefined ? undefined : presentValue(model.contextWindow);
  return window !== undefined && window > 0 ? window : undefined;
}
