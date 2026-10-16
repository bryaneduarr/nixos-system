import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { WORKER_COMMAND_TIMEOUT_MS } from "../../../constants/sessions/cleanup.constant.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import { readObjectValue } from "../herdr/read-object-value.service.ts";

const execute = promisify(execFile);

export function createWorkerHerdrCommand(socket: string): HerdrCommand {
  return async (args) => {
    const { stdout } = await execute(process.env.HERDR_BIN_PATH || "herdr", args, {
      timeout: WORKER_COMMAND_TIMEOUT_MS,
      env: { ...process.env, HERDR_SOCKET_PATH: socket, HERDR_API_SOCKET: socket },
    });
    const response = readObjectValue(JSON.parse(stdout));
    if (response.error) throw new Error("Herdr cleanup failed");
    return readObjectValue(response.result);
  };
}
