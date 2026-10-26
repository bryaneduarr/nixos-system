import type { SubagentMetadata } from "../../../../types/activity/parsing/subagent/subagent-metadata.interface.ts";
import { isRecord } from "../../../values/is-record.service.ts";
import { readNonEmptyStringState } from "../../value/read-non-empty-string-state.service.ts";
import { readSubagentModel } from "./read-subagent-model.service.ts";

export function readSubagentMetadata(details: unknown): SubagentMetadata {
  const fields = isRecord(details) ? details : {};
  return {
    model: readSubagentModel(fields.model),
    thinkingLevel: readNonEmptyStringState(fields.thinkingLevel),
  };
}
