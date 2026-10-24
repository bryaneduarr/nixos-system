import { createHash } from "node:crypto";
import { rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  LIVE_SESSION_SUFFIX,
  PRIVATE_FILE_MODE,
  PROJECT_MARKER_SUFFIX,
  TEMPORARY_FILE_SUFFIX,
} from "../../../../constants/sessions/registry/registry-files.constant.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import { prepareRegistryDirectory } from "../directory/prepare-registry-directory.service.ts";
import { markSessionUsed } from "../history/mark-session-used.service.ts";

export async function publishSessionRow(directory: string, row: LiveSession): Promise<void> {
  await prepareRegistryDirectory(directory);
  const target = join(directory, `${row.identity}${LIVE_SESSION_SUFFIX}`);
  await writeFile(`${target}${TEMPORARY_FILE_SUFFIX}`, JSON.stringify(row), { mode: PRIVATE_FILE_MODE });
  await rename(`${target}${TEMPORARY_FILE_SUFFIX}`, target);
  if (row.historyEver) await markSessionUsed(directory, row.identity);
  const projectKey = createHash("sha256").update(row.cwd).digest("hex");
  await writeFile(join(directory, `${projectKey}${PROJECT_MARKER_SUFFIX}`), row.cwd, { mode: PRIVATE_FILE_MODE });
}
