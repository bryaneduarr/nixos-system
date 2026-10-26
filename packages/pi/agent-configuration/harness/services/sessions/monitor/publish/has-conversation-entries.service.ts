import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  CONVERSATION_ENTRY_TYPES,
  CONVERSATION_MESSAGE_ROLES,
} from "../../../../constants/sessions/monitor/monitor-events.constant.ts";

export function hasConversationEntries(ctx: ExtensionContext): boolean {
  return ctx.sessionManager.getEntries().some((entry) => {
    if (CONVERSATION_ENTRY_TYPES.includes(entry.type)) return true;
    if (entry.type !== "message") return false;
    return CONVERSATION_MESSAGE_ROLES.includes(entry.message.role);
  });
}
