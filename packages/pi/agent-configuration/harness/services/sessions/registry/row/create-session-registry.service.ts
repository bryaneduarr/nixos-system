import type { SessionRegistry } from "../../../../types/sessions/registry/row/session-registry.interface.ts";
import { listProjectDirectories } from "../directory/list-project-directories.service.ts";
import { hasSessionHistory } from "../history/has-session-history.service.ts";
import { markSessionUsed } from "../history/mark-session-used.service.ts";
import { reserveSessionName } from "../name/reserve-session-name.service.ts";
import { listLiveSessions } from "./list-live-sessions.service.ts";
import { publishSessionRow } from "./publish-session-row.service.ts";
import { removeSessionRow } from "./remove-session-row.service.ts";

export function createSessionRegistry(directory: string): SessionRegistry {
  return {
    directory,
    publish: (row) => publishSessionRow(directory, row),
    instanceName: (cwd, identity) => reserveSessionName(directory, cwd, identity),
    markUsed: (identity) => markSessionUsed(directory, identity),
    hasHistory: (identity) => hasSessionHistory(directory, identity),
    remove: (identity, preserveName) => removeSessionRow(directory, identity, preserveName),
    list: () => listLiveSessions(directory, Date.now()),
    projects: () => listProjectDirectories(directory),
  };
}
