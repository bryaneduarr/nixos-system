import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import { FAST_MODE_ENTRY_TYPE } from "../../constants/fast-mode/fast-mode.constant.ts";
import { FastModeStateSchema } from "../../schemas/fast-mode/fast-mode-state.schema.ts";
import type { FastModePreferenceLookup } from "../../types/fast-mode/fast-mode-state.interface.ts";

function latestSessionFastModeEnabled(ctx: ExtensionContext): boolean {
  let enabled = false;
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "custom" || entry.customType !== FAST_MODE_ENTRY_TYPE) continue;
    const data: unknown = entry.data;
    if (Value.Check(FastModeStateSchema, data)) enabled = data.enabled;
  }
  return enabled;
}

export function resolveFastModeEnabled(ctx: ExtensionContext, preference: FastModePreferenceLookup): boolean {
  return preference.found ? preference.enabled : latestSessionFastModeEnabled(ctx);
}
