import { describe, expect, test } from "bun:test";
import { formatResetCountdown } from "./format-reset-countdown.service.ts";

const NOW = new Date("2026-10-25T12:00:00Z");

const formatAt = (resetsAt: string) => formatResetCountdown({ resetsAt, now: NOW });

describe("formatResetCountdown", () => {
  test("shows days, hours, and minutes when a day or more remains", () => {
    expect(formatAt("2026-10-28T16:12:00Z")).toEqual({ state: "formatted", text: "resets in 3d 4h 12m" });
  });

  test("drops days under 24 hours", () => {
    expect(formatAt("2026-10-25T16:12:00Z")).toEqual({ state: "formatted", text: "resets in 4h 12m" });
    expect(formatAt("2026-10-26T11:59:00Z")).toEqual({ state: "formatted", text: "resets in 23h 59m" });
  });

  test("keeps the zero hour part at exactly 24 hours", () => {
    expect(formatAt("2026-10-26T12:00:00Z")).toEqual({ state: "formatted", text: "resets in 1d 0h 0m" });
  });

  test("drops hours under one hour and rounds down to whole minutes", () => {
    expect(formatAt("2026-10-25T12:12:30Z")).toEqual({ state: "formatted", text: "resets in 12m" });
  });

  test("reports zero minutes for a time under one minute away", () => {
    expect(formatAt("2026-10-25T12:00:59Z")).toEqual({ state: "formatted", text: "resets in 0m" });
  });

  test("reports zero minutes for a time already passed", () => {
    expect(formatAt("2026-10-25T11:00:00Z")).toEqual({ state: "formatted", text: "resets in 0m" });
  });

  test("rejects timestamps that are not ISO 8601 UTC datetimes", () => {
    expect(formatAt("not-a-date")).toEqual({ state: "invalid-timestamp" });
    expect(formatAt("2026-10-25T16:12:00+02:00")).toEqual({ state: "invalid-timestamp" });
  });
});
