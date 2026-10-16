import type { Static, TSchema } from "typebox";
import { Value } from "typebox/value";
import type { JsonLineParse } from "../../../types/tools/process/json-line-parse.interface.ts";

export function parseJsonLine<Schema extends TSchema>(line: string, schema: Schema): JsonLineParse<Static<Schema>> {
  try {
    const decoded: unknown = JSON.parse(line);
    return Value.Check(schema, decoded) ? { valid: true, event: decoded } : { valid: false };
  } catch {
    return { valid: false };
  }
}
