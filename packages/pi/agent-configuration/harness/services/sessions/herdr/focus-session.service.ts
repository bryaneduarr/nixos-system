import { PI_AGENT_NAME } from "../../../constants/sessions/herdr.constant.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import { isUnknownArray } from "./is-unknown-array.service.ts";
import { paneIdentity } from "./pane-identity.service.ts";
import { readObjectValue } from "./read-object-value.service.ts";

export async function focusSession(command: HerdrCommand, registry: SessionRegistry, row: LiveSession): Promise<void> {
  const live = (await registry.list()).find((item) => item.identity === row.identity);
  if (!live || live.pane !== row.pane || live.sessionId !== row.sessionId) {
    throw new Error("Session is no longer live");
  }
  const pane = readObjectValue((await command(["pane", "get", live.pane])).pane);
  const location = paneIdentity(pane);
  const processInfo = readObjectValue((await command(["pane", "process-info", "--pane", live.pane])).process_info);
  const processes = processInfo.foreground_processes;
  const matchesProcess = isUnknownArray(processes) && processes.some((item) => readObjectValue(item).pid === live.pid);
  if (pane.agent !== PI_AGENT_NAME || location.tab !== live.tab || !matchesProcess) {
    throw new Error("The destination pane no longer hosts this Pi session");
  }
  await command(["agent", "focus", live.pane]);
}
