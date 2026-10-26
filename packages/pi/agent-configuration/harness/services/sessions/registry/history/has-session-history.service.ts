import { stat } from "node:fs/promises";
import { join } from "node:path";
import { HISTORY_SUFFIX, MISSING_FILE_CODE } from "../../../../constants/sessions/registry/registry-files.constant.ts";
import { hasErrorCode } from "../../errors/has-error-code.service.ts";
import { isSessionIdentity } from "../identity/is-session-identity.service.ts";

export async function hasSessionHistory(directory: string, identity: string): Promise<boolean> {
  if (!isSessionIdentity(identity)) return true;
  try {
    await stat(join(directory, `${identity}${HISTORY_SUFFIX}`));
    return true;
  } catch (error) {
    return !hasErrorCode(error, MISSING_FILE_CODE);
  }
}
