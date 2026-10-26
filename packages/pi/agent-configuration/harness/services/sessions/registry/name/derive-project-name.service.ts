import { basename } from "node:path";
import { PROJECT_NAME_MAX_LENGTH } from "../../../../constants/sessions/registry/registry.constant.ts";
import { PROJECT_FALLBACK_PREFIX } from "../../../../constants/sessions/registry/registry-files.constant.ts";

export function deriveProjectName(cwd: string): string {
  let project = basename(cwd)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
  if (!/^[a-z]/.test(project)) project = `${PROJECT_FALLBACK_PREFIX}${project}`;
  return project.slice(0, PROJECT_NAME_MAX_LENGTH);
}
