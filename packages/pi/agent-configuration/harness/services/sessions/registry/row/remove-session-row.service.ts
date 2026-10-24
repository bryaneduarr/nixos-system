import { rm } from "node:fs/promises";
import { join } from "node:path";
import {
  LIVE_SESSION_SUFFIX,
  RESERVATION_SUFFIX,
} from "../../../../constants/sessions/registry/registry-files.constant.ts";
import { isSessionIdentity } from "../identity/is-session-identity.service.ts";

export async function removeSessionRow(directory: string, identity: string, preserveName: boolean): Promise<void> {
  if (!isSessionIdentity(identity)) return;
  await rm(join(directory, `${identity}${LIVE_SESSION_SUFFIX}`), { force: true });
  if (!preserveName) await rm(join(directory, `${identity}${RESERVATION_SUFFIX}`), { force: true });
}
