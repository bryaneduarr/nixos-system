import { describe, expect, test } from "bun:test";
import { isAbsolute } from "node:path";
import { createProviderEnvironment } from "./create-provider-environment.service.ts";
import { fetchProviderUrlWithBun } from "./fetch-provider-url-with-bun.service.ts";

describe("createProviderEnvironment", () => {
  test("uses an absolute home directory, the given time, and the Bun fetch adapter", () => {
    const now = new Date("2026-10-25T12:00:00Z");

    const environment = createProviderEnvironment(now);

    expect(isAbsolute(environment.homeDirectory)).toBe(true);
    expect(environment.now).toBe(now);
    expect(environment.fetchUrl).toBe(fetchProviderUrlWithBun);
  });
});
