import { AGENT_LAUNCH_PENDING_CODE } from "../../../constants/sessions/herdr.constant.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import type { PaneIdentity } from "../../../types/sessions/herdr/pane-identity.interface.ts";
import { hasErrorCode } from "../registry/has-error-code.service.ts";

export async function nameHerdrPane(command: HerdrCommand, location: PaneIdentity, name: string): Promise<boolean> {
  await command(["pane", "rename", location.pane, name]);
  try {
    await command(["agent", "rename", location.pane, name]);
    return true;
  } catch (error) {
    if (hasErrorCode(error, AGENT_LAUNCH_PENDING_CODE)) return false;
    throw error;
  }
}
