import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readExitState } from "../exit/read-exit-state.service.ts";

export function installExitEvents(pi: ExtensionAPI): void {
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
