import { describe, expect, test } from "bun:test";
import { convertUsedToRemainingPercent } from "./convert-used-to-remaining-percent.service.ts";

describe("convertUsedToRemainingPercent", () => {
  test.each([
    { description: "nothing used", usedPercent: 0, percentRemaining: 100 },
    { description: "part of the window used", usedPercent: 25, percentRemaining: 75 },
    { description: "everything used", usedPercent: 100, percentRemaining: 0 },
    { description: "more than everything used", usedPercent: 120, percentRemaining: 0 },
    { description: "a negative amount used", usedPercent: -10, percentRemaining: 100 },
  ])("reports $percentRemaining percent remaining when $description", ({ usedPercent, percentRemaining }) => {
    expect(convertUsedToRemainingPercent(usedPercent)).toBe(percentRemaining);
  });
});
