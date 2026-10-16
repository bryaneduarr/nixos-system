import { mkdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { RESERVATION_STALE_MS } from "../../../constants/sessions/registry.constant.ts";
import {
  INVALID_SESSION_IDENTITY_MESSAGE,
  NAME_LOCK_DIRECTORY,
  NAME_LOCK_RETRY_MS,
  NAME_LOCK_TIMEOUT_MS,
  PRIVATE_DIRECTORY_MODE,
} from "../../../constants/sessions/registry-files.constant.ts";
import { allocateSessionName } from "./allocate-session-name.service.ts";
import { hasErrorCode } from "./has-error-code.service.ts";
import { isSessionIdentity } from "./is-session-identity.service.ts";
import { prepareRegistryDirectory } from "./prepare-registry-directory.service.ts";

export async function reserveSessionName(directory: string, cwd: string, identity: string): Promise<string> {
  if (!isSessionIdentity(identity)) throw new Error(INVALID_SESSION_IDENTITY_MESSAGE);
  await prepareRegistryDirectory(directory);
  const lock = join(directory, NAME_LOCK_DIRECTORY);
  await acquireNameLock(lock);
  try {
    return await allocateSessionName(directory, cwd, identity);
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}

async function acquireNameLock(lock: string): Promise<void> {
  const deadline = Date.now() + NAME_LOCK_TIMEOUT_MS;
  while (true) {
    try {
      await mkdir(lock, { mode: PRIVATE_DIRECTORY_MODE });
      return;
    } catch (error) {
      if (!hasErrorCode(error, "EEXIST")) throw error;
      const age = await stat(lock)
        .then((info) => Date.now() - info.mtimeMs)
        .catch(() => 0);
      if (age > RESERVATION_STALE_MS) await rm(lock, { recursive: true, force: true });
      if (Date.now() >= deadline) throw new Error("Session name allocation timed out");
      await new Promise((resolve) => setTimeout(resolve, NAME_LOCK_RETRY_MS));
    }
  }
}
