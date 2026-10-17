import { constants } from "node:fs";
import { access, realpath, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const HOME_SHORTHAND = "~/";

function expandHome(path: string): string {
  if (path === "~") return homedir();
  if (path.startsWith(HOME_SHORTHAND)) return join(homedir(), path.slice(HOME_SHORTHAND.length));
  return path;
}

export async function canonicalDirectory(path: string, cwd: string): Promise<string> {
  const canonical = await realpath(resolve(cwd, expandHome(path)));
  if (!(await stat(canonical)).isDirectory()) throw new Error("Select a directory, not a file");
  await access(canonical, constants.R_OK | constants.X_OK);
  return canonical;
}
