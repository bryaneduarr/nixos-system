import { CANNOT_PROVE_SHELL_MESSAGE, EXPLICIT_EXIT_MODE } from "../../../constants/sessions/exit/exit.constant.ts";
import {
  HERDR_PANE_CURRENT,
  HERDR_PANE_GET,
  HERDR_PANE_PROCESS_INFO,
} from "../../../constants/sessions/herdr/herdr-command.constant.ts";
import { ABSOLUTE_PATH_PATTERN } from "../../../constants/sessions/registry/registry.constant.ts";
import type { ExitTarget } from "../../../types/sessions/exit/exit-target.interface.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { PaneIdentity } from "../../../types/sessions/herdr/pane/pane-identity.interface.ts";
import { isUnknownArray } from "../../values/is-unknown-array.service.ts";
import { paneIdentity } from "../herdr/pane/pane-identity.service.ts";
import { isObjectRecord } from "../herdr/response/is-object-record.service.ts";
import { processStartIdentity } from "../registry/identity/process-start-identity.service.ts";

export async function captureExitTarget(socket: string, command: HerdrCommand): Promise<ExitTarget> {
  if (!ABSOLUTE_PATH_PATTERN.test(socket)) throw new Error("Herdr socket must be an absolute path");
  const current = paneIdentity((await command(HERDR_PANE_CURRENT)).pane);
  const pane = paneIdentity((await command([...HERDR_PANE_GET, current.pane])).pane);
  if (!isSamePane(pane, current)) throw new Error("Current pane changed");
  const shellPid = readShellPid((await command([...HERDR_PANE_PROCESS_INFO, current.pane])).process_info, current.pane);
  const processStart = await processStartIdentity(process.pid);
  const shellStart = await processStartIdentity(shellPid);
  if (!processStart || !shellStart) throw new Error("Process start identities are unavailable");
  const recheckedPane = paneIdentity((await command(HERDR_PANE_CURRENT)).pane);
  if (!isSamePane(recheckedPane, current)) throw new Error("Current pane changed");
  return {
    ...current,
    mode: EXPLICIT_EXIT_MODE,
    socket,
    pid: process.pid,
    processStart,
    shellPid,
    shellStart,
  };
}

function isSamePane(first: PaneIdentity, second: PaneIdentity): boolean {
  return first.pane === second.pane && first.tab === second.tab && first.workspace === second.workspace;
}

function readShellPid(processInfo: unknown, pane: string): number {
  if (!isObjectRecord(processInfo)) throw new Error(CANNOT_PROVE_SHELL_MESSAGE);
  const shellPid = processInfo.shell_pid;
  if (typeof shellPid !== "number") throw new Error(CANNOT_PROVE_SHELL_MESSAGE);
  const processes = processInfo.foreground_processes;
  const isPaneProcessInfo = processInfo.pane_id === pane;
  const hasValidShellPid = Number.isSafeInteger(shellPid) && shellPid >= 1;
  const isNotPiProcess = shellPid !== process.pid;
  const runsPiProcess =
    isUnknownArray(processes) &&
    processes.some((foregroundProcess) => isObjectRecord(foregroundProcess) && foregroundProcess.pid === process.pid);
  if (!isPaneProcessInfo || !hasValidShellPid || !isNotPiProcess || !runsPiProcess) {
    throw new Error(CANNOT_PROVE_SHELL_MESSAGE);
  }
  return shellPid;
}
