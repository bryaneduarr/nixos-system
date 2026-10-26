import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { OPENCODE_AUTH_RELATIVE_PATH } from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import type { FetchProviderUrl, ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";

const OPENCODE_TEST_NOW = new Date("2026-10-26T12:00:00Z");

export const FICTIONAL_OPENCODE_KEY = "example-api-key";

export const opencodeUsageBody = {
  usage: {
    rolling: { status: "ok", percent: 0, resetsAt: "2026-10-26T20:36:20.000Z" },
    weekly: { status: "ok", percent: 0, resetsAt: "2026-11-02T00:00:00.000Z" },
    monthly: { status: "ok", percent: 5, resetsAt: "2026-11-21T15:22:05.000Z" },
  },
};

export function createOpenCodeEnvironment(homeDirectory: string, fetchUrl: FetchProviderUrl): ProviderEnvironment {
  return { homeDirectory, now: OPENCODE_TEST_NOW, fetchUrl };
}

export function opencodeAuthText(apiKey = FICTIONAL_OPENCODE_KEY): string {
  return JSON.stringify({
    anthropic: { type: "oauth", access: "example-access-token", refresh: "example-refresh-token", expires: 1 },
    "opencode-go": { type: "api_key", key: apiKey },
    "other-provider": "unexpected-shape",
  });
}

export async function writeOpenCodeAuth(homeDirectory: string, authText: string): Promise<void> {
  const authPath = join(homeDirectory, OPENCODE_AUTH_RELATIVE_PATH);
  await mkdir(dirname(authPath), { recursive: true });
  await writeFile(authPath, authText);
}
