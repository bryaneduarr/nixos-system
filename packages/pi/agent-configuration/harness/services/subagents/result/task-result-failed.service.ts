import { Value } from "typebox/value";
import { FailedTaskDetailsSchema } from "../../../schemas/subagents/result/failed-task-details.schema.ts";

export function taskResultFailed(details: unknown): boolean {
  return Value.Check(FailedTaskDetailsSchema, details);
}
