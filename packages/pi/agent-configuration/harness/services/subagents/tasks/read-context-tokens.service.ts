import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";

export function readContextTokens(session: AgentSession): ValueState<number> {
  const tokens = session.getContextUsage()?.tokens;
  if (typeof tokens !== "number" || !Number.isFinite(tokens)) return { state: "absent" };

  return { state: "present", value: tokens };
}
