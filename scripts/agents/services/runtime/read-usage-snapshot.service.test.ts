import { describe, expect, test } from "bun:test";
import { readUsageSnapshot } from "./read-usage-snapshot.service.ts";

const FIRST_READ_MILLISECONDS = Date.parse("2026-10-25T12:00:00Z");
const REFRESH_INTERVAL_MILLISECONDS = 60_000;
const NO_PROVIDERS = [] as const;

function createClockAdvancingPerRead(): () => Date {
  let nextMilliseconds = FIRST_READ_MILLISECONDS;
  return () => {
    const readTime = new Date(nextMilliseconds);
    nextMilliseconds += REFRESH_INTERVAL_MILLISECONDS;
    return readTime;
  };
}

describe("readUsageSnapshot", () => {
  test("stamps every read with the moment that read started", async () => {
    const readNow = createClockAdvancingPerRead();

    const firstSnapshot = await readUsageSnapshot(NO_PROVIDERS, readNow);
    const secondSnapshot = await readUsageSnapshot(NO_PROVIDERS, readNow);

    expect(firstSnapshot.now.getTime()).toBe(FIRST_READ_MILLISECONDS);
    expect(secondSnapshot.now.getTime()).toBe(FIRST_READ_MILLISECONDS + REFRESH_INTERVAL_MILLISECONDS);
  });
});
