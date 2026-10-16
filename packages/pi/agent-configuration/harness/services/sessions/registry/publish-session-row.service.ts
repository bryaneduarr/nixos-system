import { createHash } from "node:crypto";
import { rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PRIVATE_FILE_MODE } from "../../../constants/sessions/registry-files.constant.ts";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import { markSessionUsed } from "./mark-session-used.service.ts";
import { prepareRegistryDirectory } from "./prepare-registry-directory.service.ts";

export async function publishSessionRow(directory: string, row: LiveSession): Promise<void> {
  await prepareRegistryDirectory(directory);
  const target = join(directory, `${row.identity}.json`);
  await writeFile(`${target}.tmp`, JSON.stringify(row), { mode: PRIVATE_FILE_MODE });
  await rename(`${target}.tmp`, target);
  if (row.historyEver) await markSessionUsed(directory, row.identity);
  const projectKey = createHash("sha256").update(row.cwd).digest("hex");
  await writeFile(join(directory, `${projectKey}.project`), row.cwd, { mode: PRIVATE_FILE_MODE });
}
