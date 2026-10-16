import { constants } from "node:fs";
import { access, realpath, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const HOME_SHORTHAND = "~/";

export async function canonicalDirectory(path: string, cwd: string): Promise<string> {
  const expanded = path === "~" ? homedir() : path.startsWith(HOME_SHORTHAND) ? join(homedir(), path.slice(2)) : path;
  const canonical = await realpath(resolve(cwd, expanded));
  if (!(await stat(canonical)).isDirectory()) throw new Error("Select a directory, not a file");
  await access(canonical, constants.R_OK | constants.X_OK);
  return canonical;
}
