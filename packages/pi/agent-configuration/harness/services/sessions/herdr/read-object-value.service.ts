import { isObjectRecord } from "./is-object-record.service.ts";

export function readObjectValue(value: unknown): Record<string, unknown> {
  if (!isObjectRecord(value)) throw new Error("Invalid Herdr response");
  return value;
}
