import { pathExists } from "../path/path-exists.service.ts";
import { resolveToolPath } from "../path/resolve-tool-path.service.ts";

export async function isMissingPath(cwd: string, path: string): Promise<boolean> {
  return !(await pathExists(resolveToolPath(cwd, path)));
}
