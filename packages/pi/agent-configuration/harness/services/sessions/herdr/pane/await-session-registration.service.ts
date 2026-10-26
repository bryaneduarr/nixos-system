import {
  SESSION_REGISTRATION_POLL_MS,
  SESSION_REGISTRATION_TIMEOUT_MS,
} from "../../../../constants/sessions/herdr/herdr-timing.constant.ts";
import type { SessionRegistrationWait } from "../../../../types/sessions/herdr/pane/session-registration-wait.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";

export async function awaitSessionRegistration(wait: SessionRegistrationWait): Promise<LiveSession> {
  const { registry, token, pane, cwd } = wait;
  const deadline = Date.now() + SESSION_REGISTRATION_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const ready = (await registry.list()).find((row) => row.identity === token && row.pane === pane && row.cwd === cwd);
    if (ready) return ready;
    await new Promise((resolve) => setTimeout(resolve, SESSION_REGISTRATION_POLL_MS));
  }
  throw new Error("Pi started but did not register. The new pane was left open for inspection.");
}
