import {
  SESSION_REGISTRATION_POLL_MS,
  SESSION_REGISTRATION_TIMEOUT_MS,
} from "../../../../constants/sessions/herdr-timing.constant.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import type { SessionRegistry } from "../../../../types/sessions/registry/row/session-registry.interface.ts";

export async function awaitSessionRegistration(
  registry: SessionRegistry,
  token: string,
  pane: string,
  cwd: string,
): Promise<LiveSession> {
  const deadline = Date.now() + SESSION_REGISTRATION_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const ready = (await registry.list()).find((row) => row.identity === token && row.pane === pane && row.cwd === cwd);
    if (ready) return ready;
    await new Promise((resolve) => setTimeout(resolve, SESSION_REGISTRATION_POLL_MS));
  }
  throw new Error("Pi started but did not register. The new pane was left open for inspection.");
}
