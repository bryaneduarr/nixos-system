import { homedir } from "node:os";
import { join } from "node:path";

export function resolveFastModePreferenceFile(): string {
  const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local", "state");
  return join(stateHome, "pi", "codex-fast-mode.json");
}
