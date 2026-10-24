import { rm } from "node:fs/promises";
import { join } from "node:path";
import { isSessionIdentity } from "../identity/is-session-identity.service.ts";

export async function removeSessionRow(directory: string, identity: string, preserveName: boolean): Promise<void> {
  if (!isSessionIdentity(identity)) return;
  await rm(join(directory, `${identity}.json`), { force: true });
  if (!preserveName) await rm(join(directory, `${identity}.reservation`), { force: true });
}
