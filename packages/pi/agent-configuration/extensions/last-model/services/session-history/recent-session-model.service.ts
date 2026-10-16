import { homedir } from "node:os";
import { join } from "node:path";
import type { ModelSelectionLookup } from "../../types/model-selection/model-selection.interface.ts";
import { collectSessionFiles } from "./collect-session-files.service.ts";
import { readSessionFileModel } from "./read-session-file-model.service.ts";

function newestFirst(a: { readonly modified: number }, b: { readonly modified: number }): number {
  return b.modified - a.modified;
}

export function recentSessionModel(currentSessionFile: string | undefined): ModelSelectionLookup {
  const listing = collectSessionFiles(join(homedir(), ".pi", "agent", "sessions"), currentSessionFile);
  if (!listing.listed) return { found: false };
  for (const file of listing.files.toSorted(newestFirst)) {
    const lookup = readSessionFileModel(file.path);
    if (lookup.found) return lookup;
  }
  return { found: false };
}
