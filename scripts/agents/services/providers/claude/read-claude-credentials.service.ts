import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CLAUDE_CREDENTIALS_RELATIVE_PATH } from "../../../constants/providers/claude/claude-provider.constant.ts";
import {
  claudeAccessTokenSchema,
  claudeCredentialsFileSchema,
} from "../../../schemas/providers/claude/claude-credentials.schema.ts";
import type { ClaudeCredentialRead } from "../../../types/providers/claude/claude-credentials.interface.ts";
import type { ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";

export async function readClaudeCredentials(environment: ProviderEnvironment): Promise<ClaudeCredentialRead> {
  const credentialsPath = join(environment.homeDirectory, CLAUDE_CREDENTIALS_RELATIVE_PATH);
  try {
    const rawCredentials: unknown = JSON.parse(await readFile(credentialsPath, "utf8"));
    return classifyClaudeCredentials(rawCredentials);
  } catch (error) {
    const isMissingFile = error instanceof Error && "code" in error && error.code === "ENOENT";
    return isMissingFile ? { state: "not-signed-in" } : { state: "unreadable" };
  }
}

function classifyClaudeCredentials(rawCredentials: unknown): ClaudeCredentialRead {
  const parsedCredentials = claudeCredentialsFileSchema.safeParse(rawCredentials);
  if (parsedCredentials.success) {
    return { state: "signed-in", credentials: parsedCredentials.data.claudeAiOauth };
  }
  const hasAccessToken = claudeAccessTokenSchema.safeParse(rawCredentials).success;
  return hasAccessToken ? { state: "unreadable" } : { state: "not-signed-in" };
}
