import { expect, test } from "bun:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { createPromptNavigation } from "../navigation/create-prompt-navigation.service.ts";
import { cursorRow } from "./cursor-row.service.ts";
import { moveVertical } from "./move-vertical.service.ts";
import { wrapPrompt } from "./wrap-prompt.service.ts";

test("wrapping retains source indexes for combining marks, emoji, tabs and newlines", () => {
  const navigation = createPromptNavigation("a界é👩‍💻\t\r\nb");
  for (const width of [1, 2, 3, 12]) {
    const rows = wrapPrompt(navigation.units, width);
    expect(rows.flat().map((cell) => cell.index)).toEqual(navigation.units.map((_, index) => index));
    for (const row of rows) expect(visibleWidth(row.map((cell) => cell.text).join(""))).toBeLessThanOrEqual(width);
    navigation.move(0);
    moveVertical(navigation, rows, 1);
    expect(cursorRow(rows, navigation.cursor)).toBe(1);
  }
});
