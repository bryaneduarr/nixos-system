import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  BROWSE_CHOICE,
  ENTER_PATH_CHOICE,
  PROJECT_DIRECTORY_INPUT_TITLE,
  PROJECT_PROMPT_TITLE,
} from "../../../constants/sessions/menu-choices.constant.ts";
import type { ProjectSelection } from "../../../types/sessions/menu/project-selection.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import { canonicalDirectory } from "../registry/canonical-directory.service.ts";
import { browseProjectDirectories } from "./browse-project-directories.service.ts";

export async function selectProject(ctx: ExtensionContext, registry: SessionRegistry): Promise<ProjectSelection> {
  const currentProject = await canonicalDirectory(ctx.cwd, ctx.cwd);
  const paths = [...new Set([currentProject, ...(await registry.projects())])];
  const choice = await ctx.ui.select(PROJECT_PROMPT_TITLE, [BROWSE_CHOICE, ENTER_PATH_CHOICE, ...paths]);
  if (!choice) return { selected: false };
  if (choice === BROWSE_CHOICE) return browseProjectDirectories(ctx);
  if (choice === ENTER_PATH_CHOICE) {
    const path = await ctx.ui.input(PROJECT_DIRECTORY_INPUT_TITLE, ctx.cwd);
    if (!path?.trim()) return { selected: false };
    return { selected: true, path: await canonicalDirectory(path, ctx.cwd) };
  }
  return { selected: true, path: await canonicalDirectory(choice, ctx.cwd) };
}
