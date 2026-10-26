import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  SESSIONS_COMMAND_NAME,
  SESSIONS_DESCRIPTION,
  SESSIONS_SHORTCUT,
} from "../../constants/sessions/install/sessions-command.constant.ts";

export function installSessionsCommand(pi: ExtensionAPI, show: (ctx: ExtensionContext) => Promise<void>): void {
  pi.registerShortcut(SESSIONS_SHORTCUT, { description: SESSIONS_DESCRIPTION, handler: show });
  pi.registerCommand(SESSIONS_COMMAND_NAME, {
    description: SESSIONS_DESCRIPTION,
    handler: async (_args, ctx) => show(ctx),
  });
}
