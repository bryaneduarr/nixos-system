import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OPENCODE_LOGIN_EXPIRED_MESSAGE } from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import { createFakeFetch } from "../http/fake-fetch-url.test-double.ts";
import { fetchOpenCodeUsage } from "./fetch-opencode-usage.service.ts";
import {
  createOpenCodeEnvironment,
  FICTIONAL_OPENCODE_KEY,
  opencodeAuthText,
  opencodeUsageBody,
  writeOpenCodeAuth,
} from "./fetch-opencode-usage.test-double.ts";

describe("fetchOpenCodeUsage with a saved key", () => {
  let homeDirectory: string;

  beforeEach(async () => {
    homeDirectory = await mkdtemp(join(tmpdir(), "opencode-usage-"));
  });

  afterEach(async () => {
    await rm(homeDirectory, { recursive: true, force: true });
  });

  test("reports the rolling, weekly, and monthly windows and ignores other providers' entries", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(200, opencodeUsageBody);

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toEqual({
      status: "ok",
      provider: "opencode",
      plan: { state: "unreported" },
      windows: [
        { label: "5-hour", percentRemaining: 100, resetsAt: "2026-10-26T20:36:20.000Z" },
        { label: "Weekly", percentRemaining: 100, resetsAt: "2026-11-02T00:00:00.000Z" },
        { label: "Monthly", percentRemaining: 95, resetsAt: "2026-11-21T15:22:05.000Z" },
      ],
    });
  });

  test("keeps the raw name of a window it does not recognize", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(200, {
      usage: { daily: { status: "ok", percent: 10, resetsAt: "2026-10-27T00:00:00.000Z" } },
    });

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "ok",
      windows: [{ label: "daily", percentRemaining: 90, resetsAt: "2026-10-27T00:00:00.000Z" }],
    });
  });

  test("reports ok without windows when the usage record is empty", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(200, { usage: {} });

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toEqual({
      status: "ok",
      provider: "opencode",
      plan: { state: "unreported" },
      windows: [],
    });
  });

  test("clamps reported percentages to the 0 to 100 range", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(200, {
      usage: {
        rolling: { status: "ok", percent: -5, resetsAt: "2026-10-26T20:36:20.000Z" },
        weekly: { status: "ok", percent: 120, resetsAt: "2026-11-02T00:00:00.000Z" },
      },
    });

    expect(await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl))).toMatchObject({
      status: "ok",
      windows: [
        { label: "5-hour", percentRemaining: 100 },
        { label: "Weekly", percentRemaining: 0 },
      ],
    });
  });

  test("requests the usage endpoint with the key as a single bearer header", async () => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(200, opencodeUsageBody);

    await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl));

    expect(fake.requests).toEqual([
      {
        url: "https://opencode.ai/zen/go/v1/usage",
        options: { headers: { Authorization: `Bearer ${FICTIONAL_OPENCODE_KEY}` } },
      },
    ]);
  });

  test.each([401, 403])("reports an expired key when the endpoint answers HTTP %i", async (status) => {
    await writeOpenCodeAuth(homeDirectory, opencodeAuthText());
    const fake = createFakeFetch(status, {
      error: { type: "authentication_error", code: "api_key_expired", message: "example rejection" },
    });

    const usage = await fetchOpenCodeUsage(createOpenCodeEnvironment(homeDirectory, fake.fetchUrl));

    expect(usage).toEqual({ status: "login-expired", provider: "opencode", message: OPENCODE_LOGIN_EXPIRED_MESSAGE });
    expect(JSON.stringify(usage)).not.toContain(FICTIONAL_OPENCODE_KEY);
  });
});
