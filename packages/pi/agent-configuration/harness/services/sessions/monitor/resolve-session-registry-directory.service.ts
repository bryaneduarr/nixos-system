import { basename, join } from "node:path";
import { registryDirectory } from "../registry/registry-directory.service.ts";

export function resolveSessionRegistryDirectory(socket: string): string {
  const scopedDirectory = registryDirectory(socket);
  const override = process.env.PI_SESSION_REGISTRY;
  if (!override) return scopedDirectory;
  return basename(override) === basename(scopedDirectory) ? override : join(override, basename(scopedDirectory));
}
