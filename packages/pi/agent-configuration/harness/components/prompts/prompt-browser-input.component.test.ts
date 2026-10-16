import { expect, test } from "bun:test";
import { browser, keys, settle } from "./prompt-browser.component.test-double.ts";

test("Vim controls accept Kitty-encoded printable keys", async () => {
  const copied: string[] = [];
  const { component } = browser("first\nsecond", (text) => {
    copied.push(text);
  });
  keys(component, "\x1b[118;2u", "\x1b[106u", "\x1b[121u");
  await settle();
  expect(copied).toEqual(["first\nsecond"]);
  keys(component, "\x1b[103u", "\x1b[103u", "\x1b[121u", "\x1b[103;2u");
  await settle();
  expect(copied[1]).toBe("first\nsecond");
});

test("escape cancels a selection before closing and ctrl+c always closes", () => {
  const first = browser("text");
  keys(first.component, "v", "\x1b");
  expect(first.closed()).toBe(0);
  expect(first.component.navigation.anchor).toEqual({ found: false });
  keys(first.component, "\x1b");
  expect(first.closed()).toBe(1);
  const second = browser("text");
  keys(second.component, "V", "\x03");
  expect(second.closed()).toBe(1);
});

test("focus switches to list and selecting a different prompt resets detail state", () => {
  const { component } = browser("draft");
  keys(component, "v", "l", "\t", "j");
  expect(component.selected).toBe(1);
  expect(component.navigation.text).toBe("older");
  expect(component.navigation.anchor).toEqual({ found: false });
  keys(component, "k", "\t", "l");
  expect(component.navigation.text).toBe("draft");
  expect(component.navigation.cursor).toBe(1);
});
