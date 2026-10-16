import { stat } from "node:fs/promises";
import { join } from "node:path";
import { MISSING_FILE_CODE } from "../../../constants/sessions/registry-files.constant.ts";
import { hasErrorCode } from "./has-error-code.service.ts";
import { isSessionIdentity } from "./is-session-identity.service.ts";

export async function hasSessionHistory(directory: string, identity: string): Promise<boolean> {
  if (!isSessionIdentity(identity)) return true;
  try {
    await stat(join(directory, `${identity}.history`));
    return true;
  } catch (error) {
    return !hasErrorCode(error, MISSING_FILE_CODE);
  }
}
