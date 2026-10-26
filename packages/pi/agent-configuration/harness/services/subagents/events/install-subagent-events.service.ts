import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { subagentRegistry } from "../../../stores/subagents/subagent-registry.store.ts";

export function installSubagentEvents(pi: ExtensionAPI): void {
  pi.on("session_start", () => subagentRegistry.clear());
  pi.on("session_shutdown", () => subagentRegistry.cancelAll());
}
