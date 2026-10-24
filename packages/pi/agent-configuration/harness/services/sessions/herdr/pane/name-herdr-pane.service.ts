import { AGENT_LAUNCH_PENDING_CODE } from "../../../../constants/sessions/herdr/herdr.constant.ts";
import { HERDR_AGENT_RENAME, HERDR_PANE_RENAME } from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { PaneIdentity } from "../../../../types/sessions/herdr/pane/pane-identity.interface.ts";
import { hasErrorCode } from "../../errors/has-error-code.service.ts";

export async function nameHerdrPane(command: HerdrCommand, location: PaneIdentity, name: string): Promise<boolean> {
  await command([...HERDR_PANE_RENAME, location.pane, name]);
  try {
    await command([...HERDR_AGENT_RENAME, location.pane, name]);
    return true;
  } catch (error) {
    if (hasErrorCode(error, AGENT_LAUNCH_PENDING_CODE)) return false;
    throw error;
  }
}
