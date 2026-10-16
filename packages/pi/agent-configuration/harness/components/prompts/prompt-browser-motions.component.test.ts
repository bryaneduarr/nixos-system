import { expect, test } from "bun:test";
import { browser, keys } from "./prompt-browser.component.test-double.ts";

test("detail motions navigate words, raw line edges, pages and message edges", () => {
  const { component } = browser(`one two\n${Array.from({ length: 40 }, (_, index) => `row ${index}`).join("\n")}`);
  keys(component, "w");
  expect(component.navigation.units[component.navigation.cursor]).toMatchObject({ start: 4 });
  keys(component, "b");
  expect(component.navigation.cursor).toBe(0);
  keys(component, "$");
  expect(component.navigation.units[component.navigation.cursor]).toMatchObject({ text: "o" });
  keys(component, "0");
  expect(component.navigation.cursor).toBe(0);
  keys(component, "\x04");
  expect(component.navigation.cursor).toBeGreaterThan(0);
  keys(component, "\x15");
  expect(component.navigation.cursor).toBe(0);
  keys(component, "\x1b[6~");
  expect(component.navigation.cursor).toBeGreaterThan(0);
  keys(component, "\x1b[5~");
  expect(component.navigation.cursor).toBe(0);
  keys(component, "G");
  expect(component.render(100).join("\n")).toContain("row 39");
  keys(component, "g", "g");
  expect(component.navigation.cursor).toBe(0);
});
