import { basename, join } from "node:path";
import { PI_SESSION_REGISTRY_VARIABLE } from "../../../../constants/sessions/install/environment.constant.ts";
import { registryDirectory } from "./registry-directory.service.ts";

export function resolveSessionRegistryDirectory(socket: string): string {
  const scopedDirectory = registryDirectory(socket);
  const override = process.env[PI_SESSION_REGISTRY_VARIABLE];
  if (!override) return scopedDirectory;
  return basename(override) === basename(scopedDirectory) ? override : join(override, basename(scopedDirectory));
}
