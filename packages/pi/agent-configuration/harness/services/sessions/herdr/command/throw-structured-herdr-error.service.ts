import { isObjectRecord } from "../response/is-object-record.service.ts";
import { readObjectValue } from "../response/read-object-value.service.ts";
import { herdrError } from "./herdr-error.service.ts";

const FAILURE_OUTPUT_KEYS = ["stdout", "stderr"] as const;

export function throwStructuredHerdrError(failure: unknown): void {
  for (const key of FAILURE_OUTPUT_KEYS) {
    const output = isObjectRecord(failure) ? failure[key] : undefined;
    if (typeof output !== "string" || output === "") continue;
    let response: Record<string, unknown>;
    try {
      response = readObjectValue(JSON.parse(output));
    } catch {
      continue;
    }
    if (response.error) throw herdrError(response.error);
  }
}
