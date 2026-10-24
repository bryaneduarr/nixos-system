import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";

export function readContextTokens(session: AgentSession): ValueState<number> {
  const usage = session.getContextUsage();
  if (usage === undefined) return { state: "absent" };

  const tokens = usage.tokens;
  if (typeof tokens !== "number" || !Number.isFinite(tokens)) return { state: "absent" };

  return { state: "present", value: tokens };
}
