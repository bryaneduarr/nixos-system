import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import { XDG_STATE_HOME_VARIABLE } from "../../../../constants/sessions/install/environment.constant.ts";

const REGISTRY_KEY_LENGTH = 24;

export function registryDirectory(scope: string): string {
  const key = createHash("sha256").update(scope).digest("hex").slice(0, REGISTRY_KEY_LENGTH);
  return join(process.env[XDG_STATE_HOME_VARIABLE] || join(homedir(), ".local", "state"), "pi", "sessions", key);
}
