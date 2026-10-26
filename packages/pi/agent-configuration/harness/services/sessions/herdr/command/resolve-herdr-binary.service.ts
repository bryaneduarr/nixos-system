import { DEFAULT_HERDR_BINARY } from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import { HERDR_BIN_PATH_VARIABLE } from "../../../../constants/sessions/install/environment.constant.ts";

export function resolveHerdrBinary(env: NodeJS.ProcessEnv): string {
  return env[HERDR_BIN_PATH_VARIABLE] || DEFAULT_HERDR_BINARY;
}
