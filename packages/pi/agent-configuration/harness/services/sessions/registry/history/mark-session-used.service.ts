import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  HISTORY_SUFFIX,
  INVALID_SESSION_IDENTITY_MESSAGE,
  PRIVATE_FILE_MODE,
} from "../../../../constants/sessions/registry/registry-files.constant.ts";
import { prepareRegistryDirectory } from "../directory/prepare-registry-directory.service.ts";
import { isSessionIdentity } from "../identity/is-session-identity.service.ts";

export async function markSessionUsed(directory: string, identity: string): Promise<void> {
  if (!isSessionIdentity(identity)) throw new Error(INVALID_SESSION_IDENTITY_MESSAGE);
  await prepareRegistryDirectory(directory);
  await writeFile(join(directory, `${identity}${HISTORY_SUFFIX}`), "used", { mode: PRIVATE_FILE_MODE });
}
