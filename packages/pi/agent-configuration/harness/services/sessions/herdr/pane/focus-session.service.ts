import { PI_AGENT_NAME } from "../../../../constants/sessions/herdr/herdr.constant.ts";
import {
  HERDR_AGENT_FOCUS,
  HERDR_PANE_GET,
  HERDR_PANE_PROCESS_INFO,
} from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import type { SessionRegistry } from "../../../../types/sessions/registry/row/session-registry.interface.ts";
import { isUnknownArray } from "../../../values/is-unknown-array.service.ts";
import { readObjectValue } from "../response/read-object-value.service.ts";
import { paneIdentity } from "./pane-identity.service.ts";

export async function focusSession(command: HerdrCommand, registry: SessionRegistry, row: LiveSession): Promise<void> {
  const live = (await registry.list()).find((candidate) => candidate.identity === row.identity);
  if (!live || live.pane !== row.pane || live.sessionId !== row.sessionId) {
    throw new Error("Session is no longer live");
  }
  const pane = readObjectValue((await command([...HERDR_PANE_GET, live.pane])).pane);
  const location = paneIdentity(pane);
  const processInfo = readObjectValue((await command([...HERDR_PANE_PROCESS_INFO, live.pane])).process_info);
  const processes = processInfo.foreground_processes;
  const matchesProcess =
    isUnknownArray(processes) &&
    processes.some((foregroundProcess) => readObjectValue(foregroundProcess).pid === live.pid);
  if (pane.agent !== PI_AGENT_NAME || location.tab !== live.tab || !matchesProcess) {
    throw new Error("The destination pane no longer hosts this Pi session");
  }
  await command([...HERDR_AGENT_FOCUS, live.pane]);
}
