import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  NEW_SESSION_DESCRIPTION,
  NEW_SESSION_SHORTCUT,
} from "../../constants/sessions/install/sessions-command.constant.ts";

export function installNewSessionCommand(pi: ExtensionAPI, createHere: (ctx: ExtensionContext) => Promise<void>): void {
  pi.registerShortcut(NEW_SESSION_SHORTCUT, { description: NEW_SESSION_DESCRIPTION, handler: createHere });
}
