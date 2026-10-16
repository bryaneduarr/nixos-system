import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { isRecord } from "./is-record.service.ts";
import { readBooleanState } from "./read-boolean-state.service.ts";
import { readNonNegativeNumberState } from "./read-non-negative-number-state.service.ts";
import { readStringState } from "./read-string-state.service.ts";

export function readSubagentModel(value: unknown): ValueState<SubagentModel> {
  if (!isRecord(value)) return { state: "absent" };
  const provider = value.provider;
  const id = value.id;
  if (typeof provider !== "string" || typeof id !== "string") return { state: "absent" };
  return {
    state: "present",
    value: {
      provider,
      id,
      name: readStringState(value.name),
      reasoning: readBooleanState(value.reasoning),
      contextWindow: readNonNegativeNumberState(value.contextWindow),
    },
  };
}
