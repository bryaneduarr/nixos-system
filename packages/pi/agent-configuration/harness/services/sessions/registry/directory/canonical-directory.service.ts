import { constants } from "node:fs";
import { access, realpath, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { expandHome } from "../../../tools/path/expand-home.service.ts";

export async function canonicalDirectory(path: string, cwd: string): Promise<string> {
  const canonical = await realpath(resolve(cwd, expandHome(path)));
  if (!(await stat(canonical)).isDirectory()) throw new Error("Select a directory, not a file");
  await access(canonical, constants.R_OK | constants.X_OK);
  return canonical;
}
