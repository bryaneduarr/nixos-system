import { homedir } from "node:os";
import { join } from "node:path";
import { HOME_DIRECTORY_ALIAS, HOME_PREFIX } from "../../../constants/tools/path/home.constant.ts";

export function expandHome(requestedPath: string): string {
  if (requestedPath === HOME_DIRECTORY_ALIAS) return homedir();
  return requestedPath.startsWith(HOME_PREFIX)
    ? join(homedir(), requestedPath.slice(HOME_PREFIX.length))
    : requestedPath;
}
