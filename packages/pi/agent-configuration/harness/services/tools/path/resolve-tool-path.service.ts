import { isAbsolute, resolve } from "node:path";
import { stripAtPrefix } from "./strip-at-prefix.service.ts";

export function resolveToolPath(cwd: string, value: string): string {
  const path = stripAtPrefix(value);
  return isAbsolute(path) ? path : resolve(cwd, path);
}
