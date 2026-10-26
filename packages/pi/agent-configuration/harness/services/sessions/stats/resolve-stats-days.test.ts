import { expect, test } from "bun:test";
import { DEFAULT_STATS_DAYS } from "../../../constants/sessions/stats/session-stats.constant.ts";
import { resolveStatsDays } from "./resolve-stats-days.service.ts";

test("a positive number of days is used as given", () => {
  expect(resolveStatsDays(" 30 ")).toBe(30);
});

test("missing, zero, negative, or non-numeric days fall back to the default", () => {
  for (const args of ["", "0", "-3", "week"]) {
    expect(resolveStatsDays(args)).toBe(DEFAULT_STATS_DAYS);
  }
});
