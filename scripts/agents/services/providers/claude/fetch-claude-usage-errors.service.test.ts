import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FetchProviderUrl } from "../../../types/providers/provider-environment.interface.ts";
import { createFakeFetch } from "../http/fake-fetch-url.test-double.ts";
import { fetchClaudeUsage } from "./fetch-claude-usage.service.ts";
import {
  CLAUDE_TEST_NOW,
  claudeCredentialsText,
  claudeUsageBody,
  createClaudeEnvironment,
  FICTIONAL_ACCESS_TOKEN,
  ONE_HOUR_MS,
  writeClaudeCredentials,
} from "./fetch-claude-usage.test-double.ts";

describe("fetchClaudeUsage without a usable login or response", () => {
  let homeDirectory: string;

  beforeEach(async () => {
    homeDirectory = await mkdtemp(join(tmpdir(), "claude-usage-"));
  });

  afterEach(async () => {
    await rm(homeDirectory, { recursive: true, force: true });
  });

  test("reports not signed in when the credentials file is missing", async () => {
    const fake = createFakeFetch(200, claudeUsageBody);

    expect(await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "not-signed-in",
      provider: "claude",
      message: expect.stringContaining("claude"),
    });
    expect(fake.requests).toEqual([]);
  });

  test("reports not signed in when the credentials hold no access token", async () => {
    const credentialsWithoutToken = JSON.stringify({
      claudeAiOauth: { expiresAt: CLAUDE_TEST_NOW.getTime() + ONE_HOUR_MS, subscriptionType: "max" },
    });
    await writeClaudeCredentials(homeDirectory, credentialsWithoutToken);
    const fake = createFakeFetch(200, claudeUsageBody);

    expect(await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "not-signed-in",
      provider: "claude",
    });
    expect(fake.requests).toEqual([]);
  });

  test("reports an error without leaking the token for credentials that are not valid JSON", async () => {
    await writeClaudeCredentials(homeDirectory, `{"claudeAiOauth": {"accessToken": "${FICTIONAL_ACCESS_TOKEN}"`);
    const fake = createFakeFetch(200, claudeUsageBody);

    const usage = await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toMatchObject({ status: "error", provider: "claude" });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_ACCESS_TOKEN);
    expect(fake.requests).toEqual([]);
  });

  test("reports an error without leaking the token when the access token has an unexpected shape", async () => {
    const credentialsWithBadShape = JSON.stringify({
      claudeAiOauth: { accessToken: FICTIONAL_ACCESS_TOKEN, subscriptionType: "max" },
    });
    await writeClaudeCredentials(homeDirectory, credentialsWithBadShape);
    const fake = createFakeFetch(200, claudeUsageBody);

    const usage = await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toMatchObject({ status: "error", provider: "claude" });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_ACCESS_TOKEN);
    expect(fake.requests).toEqual([]);
  });

  test("reports an error with the status code when the endpoint fails", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText());
    const fake = createFakeFetch(500, { error: "internal" });

    const usage = await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toMatchObject({ status: "error", provider: "claude", message: expect.stringContaining("500") });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_ACCESS_TOKEN);
  });

  test("reports an error when the request never completes", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText());
    const rejectingFetch: FetchProviderUrl = async () => {
      throw new Error("connection reset");
    };

    const usage = await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, rejectingFetch));

    expect(usage).toMatchObject({ status: "error", provider: "claude" });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_ACCESS_TOKEN);
  });

  test("reports an error when the usage body does not match the expected format", async () => {
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText());
    const fake = createFakeFetch(200, { limits: "not-a-list" });

    const usage = await fetchClaudeUsage(createClaudeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toMatchObject({ status: "error", provider: "claude" });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_ACCESS_TOKEN);
  });
});
