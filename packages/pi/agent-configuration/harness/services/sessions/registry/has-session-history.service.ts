import { stat } from "node:fs/promises";
import { join } from "node:path";
import { hasErrorCode } from "./has-error-code.service.ts";
import { isSessionIdentity } from "./is-session-identity.service.ts";

const MISSING_FILE_CODE = "ENOENT";

export async function hasSessionHistory(directory: string, identity: string): Promise<boolean> {
  if (!isSessionIdentity(identity)) return true;
  try {
    await stat(join(directory, `${identity}.history`));
    return true;
  } catch (error) {
    return !hasErrorCode(error, MISSING_FILE_CODE);
  }
}
