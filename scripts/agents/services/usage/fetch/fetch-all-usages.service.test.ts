import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLAUDE_USAGE_URL } from "../../../constants/providers/claude/claude-provider.constant.ts";
import {
  OPENCODE_SIGN_IN_MESSAGE,
  OPENCODE_USAGE_URL,
} from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import { PROVIDER_UNEXPECTED_FAILURE_MESSAGE } from "../../../constants/usage/usage-fetch.constant.ts";
import type { ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";
import {
  CLAUDE_TEST_NOW,
  claudeCredentialsText,
  writeClaudeCredentials,
} from "../../providers/claude/fetch-claude-usage.test-double.ts";
import { opencodeAuthText, writeOpenCodeAuth } from "../../providers/opencode/fetch-opencode-usage.test-double.ts";
import { fetchAllUsages } from "./fetch-all-usages.service.ts";
import { createRecordingEnvironment, usageBodyForUrl } from "./fetch-all-usages.test-double.ts";

describe("fetchAllUsages", () => {
  let homeDirectory: string;

  beforeEach(async () => {
    homeDirectory = await mkdtemp(join(tmpdir(), "fetch-all-usages-"));
    await writeClaudeCredentials(homeDirectory, claudeCredentialsText());
  });

  afterEach(async () => {
    await rm(homeDirectory, { recursive: true, force: true });
  });

  test("starts only the requested providers", async () => {
    const recording = createRecordingEnvironment(homeDirectory);

    await fetchAllUsages({ providers: ["claude"], environment: recording.environment });

    expect(recording.fetchedUrls).toEqual([CLAUDE_USAGE_URL]);
  });

  test("returns one usage per requested provider in display order", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const recording = createRecordingEnvironment(homeDirectory);

    const usages = await fetchAllUsages({
      providers: ["opencode", "claude", "claude"],
      environment: recording.environment,
    });

    expect(usages.map((usage) => usage.provider)).toEqual(["claude", "opencode"]);
  });

  test("reports OpenCode Go as not signed in when Pi holds no key", async () => {
    const recording = createRecordingEnvironment(homeDirectory);

    const usages = await fetchAllUsages({ providers: ["opencode"], environment: recording.environment });

    expect(usages).toEqual([{ status: "not-signed-in", provider: "opencode", message: OPENCODE_SIGN_IN_MESSAGE }]);
    expect(recording.fetchedUrls).toEqual([]);
  });

  test("requests OpenCode Go usage once Pi holds a key", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const recording = createRecordingEnvironment(homeDirectory);

    const usages = await fetchAllUsages({ providers: ["opencode"], environment: recording.environment });

    expect(usages.map((usage) => usage.status)).toEqual(["ok"]);
    expect(recording.fetchedUrls).toEqual([OPENCODE_USAGE_URL]);
  });

  test("turns an unexpected rejection into an error that omits its message", async () => {
    const recording = createRecordingEnvironment(homeDirectory);
    const failingEnvironment: ProviderEnvironment = {
      ...recording.environment,
      get now(): Date {
        throw new Error("example-internal-detail");
      },
    };

    const usages = await fetchAllUsages({ providers: ["claude"], environment: failingEnvironment });

    expect(usages).toEqual([{ status: "error", provider: "claude", message: PROVIDER_UNEXPECTED_FAILURE_MESSAGE }]);
    expect(JSON.stringify(usages)).not.toContain("example-internal-detail");
  });

  test("resolves Claude and OpenCode together once pending requests complete", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const requestStarted = Promise.withResolvers<void>();
    const releaseRequests = Promise.withResolvers<void>();
    const environment: ProviderEnvironment = {
      homeDirectory,
      now: CLAUDE_TEST_NOW,
      fetchUrl: async (url) => {
        requestStarted.resolve();
        await releaseRequests.promise;
        return { status: 200, json: async () => usageBodyForUrl(url) };
      },
    };

    const usagesRequest = fetchAllUsages({ providers: ["claude", "opencode"], environment });
    await requestStarted.promise;
    releaseRequests.resolve();

    expect((await usagesRequest).map((usage) => usage.status)).toEqual(["ok", "ok"]);
  });
});
