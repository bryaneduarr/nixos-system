import { Value } from "typebox/value";
import { CodemodeDetailsSchema } from "../../../../schemas/tool-rendering/codemode/script/codemode-details.schema.ts";
import type { CodemodeCall } from "../../../../types/tool-rendering/codemode/codemode-call.interface.ts";

export function readCodemodeCalls(details: unknown): readonly CodemodeCall[] {
  if (!Value.Check(CodemodeDetailsSchema, details)) return [];
  return details.calls.map((call) => ({
    name: call.name,
    status: call.status,
    durationMs: call.durationMs === undefined ? { state: "absent" } : { state: "present", value: call.durationMs },
  }));
}
