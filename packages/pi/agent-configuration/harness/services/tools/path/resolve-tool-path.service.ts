import { isAbsolute, resolve } from "node:path";
import { stripAtPrefix } from "./strip-at-prefix.service.ts";

export function resolveToolPath(cwd: string, requestedPath: string): string {
  const path = stripAtPrefix(requestedPath);
  return isAbsolute(path) ? path : resolve(cwd, path);
}
