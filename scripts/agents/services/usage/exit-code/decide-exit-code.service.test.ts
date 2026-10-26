import { describe, expect, test } from "bun:test";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { decideExitCode } from "./decide-exit-code.service.ts";

const usableUsage: ProviderUsage = { status: "ok", provider: "claude", plan: { state: "unreported" }, windows: [] };
const failedUsage: ProviderUsage = { status: "error", provider: "opencode", message: "Example failure message." };
const signedOutUsage: ProviderUsage = {
  status: "not-signed-in",
  provider: "claude",
  message: "Example sign-in message.",
};

describe("decideExitCode", () => {
  test("returns success when no provider was requested", () => {
    expect(decideExitCode([])).toBe(0);
  });

  test("returns success when at least one provider is usable", () => {
    expect(decideExitCode([failedUsage, usableUsage])).toBe(0);
  });

  test("returns failure when every requested provider failed", () => {
    expect(decideExitCode([failedUsage, signedOutUsage])).toBe(1);
  });

  test("returns failure when the only requested provider failed", () => {
    expect(decideExitCode([failedUsage])).toBe(1);
  });
});
