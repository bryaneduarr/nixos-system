import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFakeFetch } from "../http/fake-fetch-url.test-double.ts";
import { fetchClaudeUsage } from "./fetch-claude-usage.service.ts";
import {
  CLAUDE_TEST_NOW,
  claudeCredentialsText,
  claudeUsageBody,
  createClaudeEnvironment,
  FICTIONAL_ACCESS_TOKEN,
  writeClaudeCredentials,
} from "./fetch-claude-usage.test-double.ts";

describe("fetchClaudeUsage with a usable login", () => {
  let homeDirectory: string;

  beforeEach(async () => {
    homeDirectory = await mkdtemp(join(tmpdir(), "claude-usage-"));
  });

  afterEach(async () => {
    await rm(homeDirectory, { recursive: true, force: true });
  });

  test("reports every limit window and the plan", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText());
    const fake = createFakeFetch(200, claudeUsageBody);

    expect(await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl))).toEqual({
      status: "ok",
      provider: "claude",
      plan: { state: "reported", name: "max" },
      windows: [
        { label: "5-hour", percentRemaining: 97, resetsAt: "2026-10-25T16:00:00.000Z" },
        { label: "Weekly", percentRemaining: 96, resetsAt: "2026-11-01T00:00:00.000Z" },
        { label: "Weekly Fable", percentRemaining: 100, resetsAt: "2026-11-01T00:00:00.000Z" },
      ],
    });
  });

  test("requests the usage endpoint with the bearer token and beta header", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText());
    const fake = createFakeFetch(200, claudeUsageBody);

    await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl));

    expect(fake.requests).toEqual([
      {
        url: "https://api.anthropic.com/api/oauth/usage",
        options: {
          headers: {
            Authorization: `Bearer ${FICTIONAL_ACCESS_TOKEN}`,
            "anthropic-beta": "oauth-2025-04-20",
          },
        },
      },
    ]);
  });

  test("reports no plan when the subscription type is blank", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText("  "));
    const fake = createFakeFetch(200, claudeUsageBody);

    expect(await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "ok",
      plan: { state: "unreported" },
    });
  });

  test("reports an expired login without calling the usage endpoint", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText("max", CLAUDE_TEST_NOW.getTime() - 1));
    const fake = createFakeFetch(200, claudeUsageBody);

    expect(await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "login-expired",
      provider: "claude",
    });
    expect(fake.requests).toEqual([]);
  });

  test("reports an expired login when the access token expires exactly now", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText("max", CLAUDE_TEST_NOW.getTime()));
    const fake = createFakeFetch(200, claudeUsageBody);

    expect(await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "login-expired",
      provider: "claude",
    });
    expect(fake.requests).toEqual([]);
  });

  test.each([401, 403])("reports an expired login when the endpoint answers HTTP %i", async (status) => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText());
    const fake = createFakeFetch(status, {});

    const usage = await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toMatchObject({ status: "login-expired", provider: "claude" });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_ACCESS_TOKEN);
  });
});
