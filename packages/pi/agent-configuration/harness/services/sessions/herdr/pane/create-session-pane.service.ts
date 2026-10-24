import { randomUUID } from "node:crypto";
import type { SessionCreation } from "../../../../types/sessions/herdr/pane/session-creation.interface.ts";
import { splitSessionPane } from "./split-session-pane.service.ts";

export async function createSessionPane(creation: SessionCreation): Promise<void> {
  const token = randomUUID();
  const name = await creation.registry.instanceName(creation.cwd, token);
  try {
    await splitSessionPane({ ...creation, token, name });
  } catch (error) {
    const registered = (await creation.registry.list()).some((row) => row.identity === token);
    if (!registered) await creation.registry.remove(token, false);
    throw error;
  }
}
