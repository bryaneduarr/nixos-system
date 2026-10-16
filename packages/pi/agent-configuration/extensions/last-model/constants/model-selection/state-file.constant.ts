import { homedir } from "node:os";
import { join } from "node:path";

export const MODEL_STATE_DIRECTORY = join(process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"), "pi");
export const MODEL_STATE_FILE = join(MODEL_STATE_DIRECTORY, "last-model.json");
export const MODEL_STATE_FILE_MODE = 0o600;
