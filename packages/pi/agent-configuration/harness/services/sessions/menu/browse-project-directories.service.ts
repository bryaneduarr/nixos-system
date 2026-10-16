import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  ENTER_PATH_CHOICE,
  PARENT_DIRECTORY_CHOICE,
  PROJECT_DIRECTORY_INPUT_TITLE,
  USE_DIRECTORY_CHOICE,
} from "../../../constants/sessions/menu-choices.constant.ts";
import type { ProjectSelection } from "../../../types/sessions/menu/project-selection.interface.ts";
import { canonicalDirectory } from "../registry/canonical-directory.service.ts";

const SUBDIRECTORY_PREFIX = "./";

export async function browseProjectDirectories(ctx: ExtensionContext): Promise<ProjectSelection> {
  let cwd = await canonicalDirectory(ctx.cwd, ctx.cwd);
  while (true) {
    const children = (await readdir(cwd, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const choice = await ctx.ui.select(cwd, [
      USE_DIRECTORY_CHOICE,
      ENTER_PATH_CHOICE,
      PARENT_DIRECTORY_CHOICE,
      ...children.map((name) => `${SUBDIRECTORY_PREFIX}${name}`),
    ]);
    if (!choice) return { selected: false };
    if (choice === USE_DIRECTORY_CHOICE) return { selected: true, path: cwd };
    if (choice === ENTER_PATH_CHOICE) {
      const path = await ctx.ui.input(PROJECT_DIRECTORY_INPUT_TITLE, cwd);
      if (!path?.trim()) continue;
      cwd = await canonicalDirectory(path, cwd);
    } else {
      const target =
        choice === PARENT_DIRECTORY_CHOICE ? dirname(cwd) : join(cwd, choice.slice(SUBDIRECTORY_PREFIX.length));
      cwd = await canonicalDirectory(target, cwd);
    }
  }
}
