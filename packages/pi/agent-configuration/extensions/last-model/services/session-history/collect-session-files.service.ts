import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { SessionFile, SessionFileListing } from "../../types/session-history/session-file.interface.ts";

const SESSION_FILE_EXTENSION = ".jsonl";

function collectSessionFilesIn(directory: string, excludedFile: string | undefined): readonly SessionFile[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry): readonly SessionFile[] => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSessionFilesIn(path, excludedFile);
    const isSessionFile = entry.isFile() && entry.name.endsWith(SESSION_FILE_EXTENSION);
    if (!isSessionFile || path === excludedFile) return [];
    return [{ path, modified: statSync(path).mtimeMs }];
  });
}

export function collectSessionFiles(directory: string, excludedFile: string | undefined): SessionFileListing {
  try {
    return { listed: true, files: collectSessionFilesIn(directory, excludedFile) };
  } catch {
    return { listed: false };
  }
}
