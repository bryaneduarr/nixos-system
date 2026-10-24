import { realpath } from "node:fs/promises";
import {
  HERDR_API_SOCKET_VARIABLE,
  HERDR_SOCKET_PATH_VARIABLE,
} from "../../../constants/sessions/install/environment.constant.ts";
import type { ExitDependencies } from "../../../types/sessions/exit/exit-dependencies.interface.ts";
import type { ScheduledCleanup } from "../../../types/sessions/exit/scheduled-cleanup.interface.ts";
import { captureExitTarget } from "./capture-exit-target.service.ts";

export async function scheduleHerdrExit(dependencies: ExitDependencies): Promise<ScheduledCleanup> {
  const socketPath = process.env[HERDR_SOCKET_PATH_VARIABLE] || process.env[HERDR_API_SOCKET_VARIABLE];
  if (!socketPath) throw new Error("Herdr did not provide a socket");
  const socket = await realpath(socketPath);
  const target = await captureExitTarget(socket, dependencies.command(socket));
  return { scheduled: true, cancel: await dependencies.schedule(target) };
}
