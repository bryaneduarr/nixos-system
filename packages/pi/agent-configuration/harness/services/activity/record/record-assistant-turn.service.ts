import type { RecordAssistantTurnInput } from "../../../types/activity/record/record-assistant-turn-input.interface.ts";
import { recordReply } from "./record-reply.service.ts";
import { recordTokens } from "./record-tokens.service.ts";

export function recordAssistantTurn(input: RecordAssistantTurnInput): void {
  const { idSuffix, snapshot, usage, hasApiError, cwd, startedAt, endedAt } = input;
  const isFinalReply = !snapshot.hasToolCall && !hasApiError && snapshot.response.trim() !== "";

  if (isFinalReply) recordReply({ id: `reply-${idSuffix}`, cwd, startedAt, endedAt }, snapshot.response);
  if (usage.usageState === "reported") recordTokens({ id: `tokens-${idSuffix}`, cwd, startedAt, endedAt }, usage.usage);
}
