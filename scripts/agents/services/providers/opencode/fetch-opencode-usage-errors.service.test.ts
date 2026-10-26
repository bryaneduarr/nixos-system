import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  OPENCODE_AUTH_UNREADABLE_MESSAGE,
  OPENCODE_SIGN_IN_MESSAGE,
  OPENCODE_USAGE_MALFORMED_MESSAGE,
  OPENCODE_USAGE_NETWORK_ERROR_MESSAGE,
} from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import type { FetchProviderUrl } from "../../../types/providers/provider-environment.interface.ts";
import { createFakeFetch } from "../http/fake-fetch-url.test-double.ts";
import { fetchOpenCodeUsage } from "./fetch-opencode-usage.service.ts";
import {
  createOpenCodeEnvironment,
  FICTIONAL_OPENCODE_KEY,
  opencodeAuthText,
  opencodeUsageBody,
  writeOpenCodeAuth,
} from "./fetch-opencode-usage.test-double.ts";

describe("fetchOpenCodeUsage without a usable key or response", () => {
  let homeDirectory: string;

  beforeEach(async () => {
    homeDirectory = await mkdtemp(join(tmpdir(), "opencode-usage-"));
  });

  afterEach(async () => {
    await rm(homeDirectory, { recursive: true, force: true });
  });

  test("reports not signed in when the auth file is missing", async () => {
    const fake = createFakeFetch(200, opencodeUsageBody);

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toEqual({
      status: "not-signed-in",
      provider: "opencode",
      message: OPENCODE_SIGN_IN_MESSAGE,
    });
    expect(fake.requests).toEqual([]);
  });

  test("reports not signed in when only other providers have entries", async () => {
    await writeOpenCodeAuth(homeDirectory, JSON.stringify({ anthropic: { type: "oauth", access: "example-token" } }));
    const fake = createFakeFetch(200, opencodeUsageBody);

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "not-signed-in",
      provider: "opencode",
    });
    expect(fake.requests).toEqual([]);
  });

  test("reports not signed in when the key is empty", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText(""));
    const fake = createFakeFetch(200, opencodeUsageBody);

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "not-signed-in",
      provider: "opencode",
    });
    expect(fake.requests).toEqual([]);
  });

  test("reports not signed in when the entry has no key", async () => {
    await writeOpenCodeAuth(homeDirectory, JSON.stringify({ "opencode-go": { type: "api_key" } }));
    const fake = createFakeFetch(200, opencodeUsageBody);

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "not-signed-in",
      provider: "opencode",
    });
    expect(fake.requests).toEqual([]);
  });

  test("reports an error without leaking the key when the auth file is not valid JSON", async () => {
    await writeOpenCodeAuth(homeDirectory, `{"opencode-go": {"type": "api_key", "key": "${FICTIONAL_OPENCODE_KEY}"`);
    const fake = createFakeFetch(200, opencodeUsageBody);

    const usage = await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toEqual({ status: "error", provider: "opencode", message: OPENCODE_AUTH_UNREADABLE_MESSAGE });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_OPENCODE_KEY);
    expect(fake.requests).toEqual([]);
  });

  test.each([
    { "opencode-go": { type: "api_key", key: 42 } },
    { "opencode-go": FICTIONAL_OPENCODE_KEY },
    { "opencode-go": { key: FICTIONAL_OPENCODE_KEY } },
  ])("reports an error without leaking the key when the entry has an unexpected shape", async (entry) => {
    await writeOpenCodeAuth(homeDirectory, JSON.stringify(entry));
    const fake = createFakeFetch(200, opencodeUsageBody);

    const usage = await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toEqual({ status: "error", provider: "opencode", message: OPENCODE_AUTH_UNREADABLE_MESSAGE });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_OPENCODE_KEY);
    expect(fake.requests).toEqual([]);
  });

  test("reports an error with the status code when the endpoint fails", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(500, { error: { message: "example internal failure" } });

    const usage = await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toEqual({
      status: "error",
      provider: "opencode",
      message: "OpenCode Go usage request failed with HTTP 500.",
    });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_OPENCODE_KEY);
  });

  test("reports an error when the request never completes", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const rejectingFetch: FetchProviderUrl = async () => {
      throw new Error("connection reset");
    };

    const usage = await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, rejectingFetch));

    expect(usage).toEqual({ status: "error", provider: "opencode", message: OPENCODE_USAGE_NETWORK_ERROR_MESSAGE });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_OPENCODE_KEY);
  });

  test.each([
    { usage: "not-a-record" },
    { usage: { rolling: { status: "ok", percent: 1 } } },
    { usage: { rolling: { status: "ok", percent: 1, resetsAt: "not-a-date" } } },
    { status: "ok" },
  ])("reports an error when the usage body does not match the expected format", async (body) => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(200, body);

    const usage = await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toEqual({ status: "error", provider: "opencode", message: OPENCODE_USAGE_MALFORMED_MESSAGE });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_OPENCODE_KEY);
  });
});
