import { describe, expect, test } from "bun:test";
import {
  CARRIAGE_RETURN,
  CONTROL_SEQUENCE_INTRODUCER,
  CURSOR_UP_FINAL_BYTE,
  ERASE_BELOW_SEQUENCE,
} from "../../constants/runtime/terminal-sequence.constant.ts";
import { buildInPlaceReplacement } from "./build-in-place-replacement.service.ts";

describe("buildInPlaceReplacement", () => {
  test("clears below the cursor without moving it when nothing was printed before", () => {
    expect(buildInPlaceReplacement(0, "cards\n")).toBe(`${CARRIAGE_RETURN}${ERASE_BELOW_SEQUENCE}cards\n`);
  });

  test("moves up by the rows printed before, then clears below", () => {
    const moveUp = `${CONTROL_SEQUENCE_INTRODUCER}3${CURSOR_UP_FINAL_BYTE}`;
    expect(buildInPlaceReplacement(3, "cards\n")).toBe(`${CARRIAGE_RETURN}${moveUp}${ERASE_BELOW_SEQUENCE}cards\n`);
  });
});
