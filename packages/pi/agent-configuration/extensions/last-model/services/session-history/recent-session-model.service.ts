import { homedir } from "node:os";
import { join } from "node:path";
import type { ModelSelectionLookup } from "../../types/model-selection/model-selection.interface.ts";
import type { ExcludedSessionFile, SessionFile } from "../../types/session-history/session-file.interface.ts";
import { collectSessionFiles } from "./collect-session-files.service.ts";
import { readSessionFileModel } from "./read-session-file-model.service.ts";

function newestFirst(a: SessionFile, b: SessionFile): number {
  return b.modified - a.modified;
}

export function recentSessionModel(excludedFile: ExcludedSessionFile): ModelSelectionLookup {
  const listing = collectSessionFiles(join(homedir(), ".pi", "agent", "sessions"), excludedFile);
  if (!listing.listed) return { found: false };
  for (const file of listing.files.toSorted(newestFirst)) {
    const lookup = readSessionFileModel(file.path);
    if (lookup.found) return lookup;
  }
  return { found: false };
}
