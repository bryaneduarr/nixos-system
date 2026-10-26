import type { BlockedRunDirectory } from "../../../types/tools/run/blocked-run-directory.interface.ts";

export function describeBlockedRunDirectory(runDirectory: BlockedRunDirectory): string {
  if (runDirectory.reason === "not-a-directory") {
    return `${runDirectory.directory} is not a directory.\nCreate the directory first, then run again.`;
  }
  return `Could not create ${runDirectory.directory}.\nCheck the path and its permissions, then run again.`;
}
