import { describe, expect, test } from "bun:test";
import { buildUsageBar } from "./build-usage-bar.service.ts";

const filledCell = "█";
const emptyCell = "░";

describe("buildUsageBar", () => {
  test("fills cells in proportion to the percent remaining", () => {
    expect(buildUsageBar({ percent: 100, colorEnabled: false })).toBe(filledCell.repeat(20));
    expect(buildUsageBar({ percent: 97, colorEnabled: false })).toBe(`${filledCell.repeat(19)}${emptyCell}`);
    expect(buildUsageBar({ percent: 50, colorEnabled: false })).toBe(`${filledCell.repeat(10)}${emptyCell.repeat(10)}`);
    expect(buildUsageBar({ percent: 0, colorEnabled: false })).toBe(emptyCell.repeat(20));
  });

  test("colors the bar green above 50 percent", () => {
    expect(buildUsageBar({ percent: 51, colorEnabled: true })).toContain(`\u001b[32m${filledCell}`);
  });

  test("colors the bar yellow from 21 to 50 percent", () => {
    expect(buildUsageBar({ percent: 50, colorEnabled: true })).toContain(`\u001b[33m${filledCell}`);
    expect(buildUsageBar({ percent: 21, colorEnabled: true })).toContain(`\u001b[33m${filledCell}`);
  });

  test("colors the bar red at 20 percent or below", () => {
    expect(buildUsageBar({ percent: 20, colorEnabled: true })).toContain(`\u001b[31m${filledCell}`);
  });

  test("fills one cell for a nonzero percent below the first cell threshold", () => {
    expect(buildUsageBar({ percent: 1, colorEnabled: false })).toBe(`${filledCell}${emptyCell.repeat(19)}`);
    expect(buildUsageBar({ percent: 2, colorEnabled: false })).toBe(`${filledCell}${emptyCell.repeat(19)}`);
  });

  test("colors a one or two percent bar red with its single filled cell", () => {
    expect(buildUsageBar({ percent: 1, colorEnabled: true })).toContain(`\u001b[31m${filledCell}`);
    expect(buildUsageBar({ percent: 2, colorEnabled: true })).toContain(`\u001b[31m${filledCell}`);
  });
});
