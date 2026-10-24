import { expect, test } from "bun:test";
import { formatDuration } from "./format-duration.service.ts";

test("durations read as milliseconds, seconds, minutes, or hours", () => {
  expect(formatDuration(450)).toBe("450ms");
  expect(formatDuration(4500)).toBe("4.5s");
  expect(formatDuration(45_000)).toBe("45s");
  expect(formatDuration(65_000)).toBe("1m 05s");
  expect(formatDuration(3_723_000)).toBe("1h 02m 03s");
});
