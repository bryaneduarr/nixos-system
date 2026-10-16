import { readFileSync } from "node:fs";
import { Value } from "typebox/value";
import { FastModeStateSchema } from "../../../schemas/fast-mode/fast-mode-state.schema.ts";
import type { FastModePreferenceLookup } from "../../../types/fast-mode/fast-mode-state.interface.ts";
import { resolveFastModePreferenceFile } from "./resolve-fast-mode-preference-file.service.ts";

export function readFastModePreference(): FastModePreferenceLookup {
  try {
    const value: unknown = JSON.parse(readFileSync(resolveFastModePreferenceFile(), "utf8"));
    return Value.Check(FastModeStateSchema, value) ? { found: true, enabled: value.enabled } : { found: false };
  } catch {
    return { found: false };
  }
}
