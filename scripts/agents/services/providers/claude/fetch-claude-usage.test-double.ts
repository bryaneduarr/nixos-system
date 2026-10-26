import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CLAUDE_CREDENTIALS_RELATIVE_PATH } from "../../../constants/providers/claude/claude-provider.constant.ts";
import type { FetchProviderUrl, ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";

export const FICTIONAL_ACCESS_TOKEN = "example-access-token";
export const CLAUDE_TEST_NOW = new Date("2026-10-25T12:00:00Z");
export const ONE_HOUR_MS = 60 * 60 * 1000;

export const claudeUsageBody = {
  five_hour: { utilization: 3, resets_at: "2026-10-25T16:00:00.000000+00:00" },
  limits: [
    {
      kind: "session",
      group: "session",
      percent: 3,
      severity: "ok",
      resets_at: "2026-10-25T16:00:00+00:00",
      scope: null,
      is_active: true,
    },
    {
      kind: "weekly_all",
      group: "weekly",
      percent: 4,
      severity: "ok",
      resets_at: "2026-11-01T00:00:00+00:00",
      scope: null,
      is_active: true,
    },
    {
      kind: "weekly_scoped",
      group: "weekly",
      percent: 0,
      severity: "ok",
      resets_at: "2026-11-01T00:00:00+00:00",
      scope: { model: { id: null, display_name: "Fable" }, surface: null },
      is_active: true,
    },
  ],
};

export function createClaudeEnvironment(homeDirectory: string, fetchUrl: FetchProviderUrl): ProviderEnvironment {
  return { homeDirectory, now: CLAUDE_TEST_NOW, fetchUrl };
}

export function claudeCredentialsText(subscriptionType = "max", expiresAt = CLAUDE_TEST_NOW.getTime() + ONE_HOUR_MS) {
  return JSON.stringify({
    claudeAiOauth: {
      accessToken: FICTIONAL_ACCESS_TOKEN,
      expiresAt,
      subscriptionType,
      rateLimitTier: "default_claude_max_5x",
    },
    unrelatedSetting: { enabled: true },
  });
}

export async function writeClaudeCredentials(homeDirectory: string, credentialsText: string): Promise<void> {
  const credentialsPath = join(homeDirectory, CLAUDE_CREDENTIALS_RELATIVE_PATH);
  await mkdir(dirname(credentialsPath), { recursive: true });
  await writeFile(credentialsPath, credentialsText);
}
