import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { PI_MANAGED_SESSION_VARIABLE } from "../../../constants/sessions/install/environment.constant.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/row/session-registry.interface.ts";
import { createSessionRegistry } from "../registry/row/create-session-registry.service.ts";

const MANAGED_SESSION_ARGUMENT_PREFIX = `${PI_MANAGED_SESSION_VARIABLE}=`;

export function createRegistryIn(root: string): SessionRegistry {
  return createSessionRegistry(join(root, randomUUID()));
}

export function managedSessionToken(args: readonly string[]): string {
  const argument = args.find((candidate) => candidate.startsWith(MANAGED_SESSION_ARGUMENT_PREFIX));
  if (argument === undefined) throw new Error("Missing managed session environment argument");
  return argument.slice(MANAGED_SESSION_ARGUMENT_PREFIX.length);
}
