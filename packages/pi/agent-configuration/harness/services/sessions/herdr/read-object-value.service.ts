import { isObjectRecord } from "./is-object-record.service.ts";

export function readObjectValue(candidate: unknown): Record<string, unknown> {
  if (!isObjectRecord(candidate)) throw new Error("Invalid Herdr response");
  return candidate;
}
