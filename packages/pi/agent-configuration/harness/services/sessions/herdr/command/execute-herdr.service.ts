import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  HERDR_COMMAND_TIMEOUT_MS,
  HERDR_MAX_BUFFER_BYTES,
} from "../../../../constants/sessions/herdr/herdr.constant.ts";
import { HERDR_PANE, SILENT_HERDR_COMMANDS } from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import { readObjectValue } from "../response/read-object-value.service.ts";
import { herdrError } from "./herdr-error.service.ts";
import { resolveHerdrBinary } from "./resolve-herdr-binary.service.ts";
import { throwStructuredHerdrError } from "./throw-structured-herdr-error.service.ts";

const execute = promisify(execFile);

export async function executeHerdr(args: readonly string[], env: NodeJS.ProcessEnv): Promise<Record<string, unknown>> {
  const binary = resolveHerdrBinary(env);
  let stdout: string;
  try {
    ({ stdout } = await execute(binary, args, {
      timeout: HERDR_COMMAND_TIMEOUT_MS,
      maxBuffer: HERDR_MAX_BUFFER_BYTES,
      env,
    }));
  } catch (error) {
    throwStructuredHerdrError(error);
    throw error;
  }
  if (!stdout.trim() && isSilentCommand(args)) return {};
  const response = readObjectValue(JSON.parse(stdout));
  if (response.error) throw herdrError(response.error);
  return readObjectValue(response.result);
}

function isSilentCommand(args: readonly string[]): boolean {
  const subcommand = args[1];
  return args[0] === HERDR_PANE && subcommand !== undefined && SILENT_HERDR_COMMANDS.has(subcommand);
}
