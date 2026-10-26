import { homedir } from "node:os";
import type { ProviderEnvironment } from "../../types/providers/provider-environment.interface.ts";
import { fetchProviderUrlWithBun } from "./fetch-provider-url-with-bun.service.ts";
import { resolveHomeDirectory } from "./resolve-home-directory.service.ts";

export function createProviderEnvironment(now: Date): ProviderEnvironment {
  return {
    homeDirectory: resolveHomeDirectory(process.env.HOME, homedir()),
    now,
    fetchUrl: fetchProviderUrlWithBun,
  };
}
