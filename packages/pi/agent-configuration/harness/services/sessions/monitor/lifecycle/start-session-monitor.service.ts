import { realpath } from "node:fs/promises";
import { resolve } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getKeybindings } from "@earendil-works/pi-tui";
import {
  HERDR_API_SOCKET_VARIABLE,
  HERDR_ENVIRONMENT_ENABLED,
  HERDR_ENVIRONMENT_VARIABLE,
  HERDR_SOCKET_PATH_VARIABLE,
  PI_MANAGED_SESSION_VARIABLE,
} from "../../../../constants/sessions/install/environment.constant.ts";
import { SESSION_REFRESH_INTERVAL_MS } from "../../../../constants/sessions/monitor/monitor.constant.ts";
import { PASTE_IMAGE_KEYBINDING } from "../../../../constants/sessions/monitor/monitor-events.constant.ts";
import { usedSessionIdentities } from "../../../../stores/sessions/used-session-identities.store.ts";
import type { SessionDependencies } from "../../../../types/sessions/install/session-dependencies.interface.ts";
import type { MonitoredSession } from "../../../../types/sessions/monitor/monitored-session.interface.ts";
import type { SessionMonitorState } from "../../../../types/sessions/monitor/session-monitor-state.interface.ts";
import { canonicalDirectory } from "../../registry/directory/canonical-directory.service.ts";
import { resolveSessionRegistryDirectory } from "../../registry/directory/resolve-session-registry-directory.service.ts";
import { isSessionIdentity } from "../../registry/identity/is-session-identity.service.ts";
import { processSessionIdentity } from "../../registry/identity/process-session-identity.service.ts";
import { createSessionRegistry } from "../../registry/row/create-session-registry.service.ts";
import { latchSessionHistory } from "../publish/latch-session-history.service.ts";
import { publishSessionMonitor } from "../publish/publish-session-monitor.service.ts";
import { canReportSession } from "./can-report-session.service.ts";
import { stopSessionMonitor } from "./stop-session-monitor.service.ts";

export async function startSessionMonitor(
  state: SessionMonitorState,
  ctx: ExtensionContext,
  dependencies: SessionDependencies,
): Promise<void> {
  await stopSessionMonitor(state, true);
  const isHerdrEnvironment = process.env[HERDR_ENVIRONMENT_VARIABLE] === HERDR_ENVIRONMENT_ENABLED;
  if (!canReportSession(ctx.mode, isHerdrEnvironment)) return;
  try {
    const socket = await readSessionSocket();
    const registry = createSessionRegistry(resolveSessionRegistryDirectory(socket));
    const herdr = dependencies.herdr(registry, socket);
    const pane = await herdr.current();
    const identity = await resolveSessionIdentity(socket);
    const cwd = await canonicalDirectory(ctx.cwd, ctx.cwd);
    state.historyEver ||= usedSessionIdentities.has(identity) || (await registry.hasHistory(identity));
    state.compacting = false;
    const session: MonitoredSession = {
      identity,
      cwd,
      socket,
      registry,
      herdr,
      pane,
      context: ctx,
      name: { state: "absent" },
      latest: { state: "absent" },
      reported: { state: "absent" },
      named: { state: "absent" },
      timer: { state: "absent" },
      removeInputListener: { state: "absent" },
      publishing: { state: "absent" },
    };
    state.session = { state: "present", value: session };
    session.removeInputListener = {
      state: "present",
      value: ctx.ui.onTerminalInput((data) => {
        if (getKeybindings().matches(data, PASTE_IMAGE_KEYBINDING)) {
          latchSessionHistory(state);
          void registry.markUsed(identity).catch(() => {});
        }
        return undefined;
      }),
    };
    await publishSessionMonitor(state);
    session.timer = {
      state: "present",
      value: setInterval(() => void publishSessionMonitor(state).catch(() => {}), SESSION_REFRESH_INTERVAL_MS),
    };
  } catch (error) {
    await stopSessionMonitor(state, false);
    ctx.ui.notify(`Session manager unavailable: ${String(error)}`, "warning");
  }
}

async function readSessionSocket(): Promise<string> {
  const configured = process.env[HERDR_SOCKET_PATH_VARIABLE] || process.env[HERDR_API_SOCKET_VARIABLE];
  if (!configured) throw new Error("Herdr did not provide a session socket");
  return realpath(resolve(configured)).catch(() => resolve(configured));
}

async function resolveSessionIdentity(socket: string): Promise<string> {
  const managed = process.env[PI_MANAGED_SESSION_VARIABLE];
  if (managed !== undefined && isSessionIdentity(managed)) return managed;
  return processSessionIdentity(socket, process.pid);
}
