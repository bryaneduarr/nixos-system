import { expect, test } from "bun:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { browser, keys } from "./prompt-browser.component.test-double.ts";

test("resize preserves raw selections and bounds both dimensions", () => {
  const { component, terminal } = browser(`${"界🙂é\t".repeat(100)}\nend`);
  keys(component, "v", "l", "l");
  const selected = component.navigation.selectedText();
  for (const height of [1, 2, 5, 12, 30]) {
    terminal.rows = height;
    for (const width of [0, 1, 2, 5, 30, 63, 64, 100]) {
      component.invalidate();
      const lines = component.render(width);
      expect(lines.length).toBeLessThanOrEqual(height);
      for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
      expect(component.navigation.selectedText()).toEqual(selected);
    }
  }
});
