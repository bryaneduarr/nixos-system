import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { SESSION_STALE_MS } from "../../../../constants/sessions/registry/registry.constant.ts";
import {
  LIVE_SESSION_FILE_PATTERN,
  LIVE_SESSION_SUFFIX,
} from "../../../../constants/sessions/registry/registry-files.constant.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import { prepareRegistryDirectory } from "../directory/prepare-registry-directory.service.ts";
import { processStartIdentity } from "../identity/process-start-identity.service.ts";
import { parseSessionRow } from "./parse-session-row.service.ts";
import { removeSessionRow } from "./remove-session-row.service.ts";

export async function listLiveSessions(directory: string, now: number): Promise<LiveSession[]> {
  await prepareRegistryDirectory(directory);
  const liveSessions: LiveSession[] = [];
  for (const file of await readdir(directory)) {
    if (!LIVE_SESSION_FILE_PATTERN.test(file)) continue;
    try {
      const parsed = parseSessionRow(JSON.parse(await readFile(join(directory, file), "utf8")));
      if (!parsed.valid || `${parsed.row.identity}${LIVE_SESSION_SUFFIX}` !== file) continue;
      const row = parsed.row;
      if (now - row.updatedAt > SESSION_STALE_MS) {
        await removeSessionRow(directory, row.identity, false);
        continue;
      }
      if (!(await isRunningProcess(row))) {
        await removeSessionRow(directory, row.identity, false);
        continue;
      }
      liveSessions.push(row);
    } catch {}
  }
  return liveSessions.sort((a, b) => a.cwd.localeCompare(b.cwd) || a.name.localeCompare(b.name));
}

async function isRunningProcess(row: LiveSession): Promise<boolean> {
  try {
    process.kill(row.pid, 0);
    return row.processStart !== "" && row.processStart === (await processStartIdentity(row.pid));
  } catch {
    return false;
  }
}
