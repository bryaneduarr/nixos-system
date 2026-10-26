import { describe, expect, test } from "bun:test";
import { CONTROL_SEQUENCE_INTRODUCER } from "../../constants/runtime/terminal-sequence.constant.ts";
import { countPhysicalRows } from "./count-physical-rows.service.ts";

const COLORED_FOUR_CHARACTERS = `${CONTROL_SEQUENCE_INTRODUCER}31mabcd${CONTROL_SEQUENCE_INTRODUCER}0m\n`;

describe("countPhysicalRows", () => {
  test("counts one row for each line that fits the width", () => {
    expect(countPhysicalRows("abc\ndef\n", 10)).toBe(2);
  });

  test("counts every row a line wraps to at the given width", () => {
    expect(countPhysicalRows("abcdefghijkl\n", 5)).toBe(3);
  });

  test("counts a blank line as one row", () => {
    expect(countPhysicalRows("\n", 5)).toBe(1);
  });

  test("counts colored text by its visible width", () => {
    expect(countPhysicalRows(COLORED_FOUR_CHARACTERS, 4)).toBe(1);
  });

  test("counts nothing for an empty frame", () => {
    expect(countPhysicalRows("", 80)).toBe(0);
  });
});
