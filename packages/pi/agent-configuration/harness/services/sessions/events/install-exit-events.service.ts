import type { ExitEventsApi } from "../../../types/sessions/exit/exit-events-api.interface.ts";
import { readExitState } from "../exit/read-exit-state.service.ts";

export function installExitEvents(pi: ExitEventsApi): void {
  pi.on("session_shutdown", (event) => {
    if (event.reason === "quit") return;
    const state = readExitState();
    state.generation++;
    if (state.cancellation.scheduled) state.cancellation.cancel();
    state.cancellation = { scheduled: false };
    state.busy = false;
    state.requested = false;
  });
}
