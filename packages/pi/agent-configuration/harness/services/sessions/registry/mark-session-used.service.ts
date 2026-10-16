import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  INVALID_SESSION_IDENTITY_MESSAGE,
  PRIVATE_FILE_MODE,
} from "../../../constants/sessions/registry-files.constant.ts";
import { isSessionIdentity } from "./is-session-identity.service.ts";
import { prepareRegistryDirectory } from "./prepare-registry-directory.service.ts";

export async function markSessionUsed(directory: string, identity: string): Promise<void> {
  if (!isSessionIdentity(identity)) throw new Error(INVALID_SESSION_IDENTITY_MESSAGE);
  await prepareRegistryDirectory(directory);
  await writeFile(join(directory, `${identity}.history`), "used", { mode: PRIVATE_FILE_MODE });
}
