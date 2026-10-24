import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { WORKER_COMMAND_TIMEOUT_MS } from "../../../../constants/sessions/cleanup/cleanup-timing.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { readObjectValue } from "../response/read-object-value.service.ts";
import { resolveHerdrBinary } from "./resolve-herdr-binary.service.ts";
import { socketEnvironment } from "./socket-environment.service.ts";

const execute = promisify(execFile);

export function createWorkerHerdrCommand(socket: string): HerdrCommand {
  return async (args) => {
    const { stdout } = await execute(resolveHerdrBinary(process.env), args, {
      timeout: WORKER_COMMAND_TIMEOUT_MS,
      env: socketEnvironment(socket),
    });
    const response = readObjectValue(JSON.parse(stdout));
    if (response.error) throw new Error("Herdr cleanup failed");
    return readObjectValue(response.result);
  };
}
