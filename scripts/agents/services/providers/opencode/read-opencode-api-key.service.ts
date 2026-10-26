import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  OPENCODE_AUTH_ENTRY_NAME,
  OPENCODE_AUTH_RELATIVE_PATH,
} from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import {
  opencodeAuthAbsenceSchema,
  opencodeAuthFileSchema,
} from "../../../schemas/providers/opencode/opencode-auth.schema.ts";
import type { OpenCodeKeyRead } from "../../../types/providers/opencode/opencode-auth.interface.ts";
import type { ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";

export async function readOpenCodeApiKey(environment: ProviderEnvironment): Promise<OpenCodeKeyRead> {
  const authPath = join(environment.homeDirectory, OPENCODE_AUTH_RELATIVE_PATH);
  try {
    const rawAuth: unknown = JSON.parse(await readFile(authPath, "utf8"));
    return classifyOpenCodeAuth(rawAuth);
  } catch (error) {
    const isMissingFile = error instanceof Error && "code" in error && error.code === "ENOENT";
    return isMissingFile ? { state: "not-signed-in" } : { state: "unreadable" };
  }
}

function classifyOpenCodeAuth(rawAuth: unknown): OpenCodeKeyRead {
  const parsedAuth = opencodeAuthFileSchema.safeParse(rawAuth);
  if (parsedAuth.success) return { state: "signed-in", apiKey: parsedAuth.data[OPENCODE_AUTH_ENTRY_NAME].key };
  const hasNoKey = opencodeAuthAbsenceSchema.safeParse(rawAuth).success;
  return hasNoKey ? { state: "not-signed-in" } : { state: "unreadable" };
}
