import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { isRecord } from "./is-record.service.ts";

export function readApiError(message: unknown): ValueState<string> {
  if (!isRecord(message) || message.role !== "assistant" || message.stopReason !== "error") return { state: "absent" };
  const errorMessage = message.errorMessage;
  const hasErrorMessage = typeof errorMessage === "string" && errorMessage.trim() !== "";
  return hasErrorMessage ? { state: "present", value: errorMessage } : { state: "absent" };
}
