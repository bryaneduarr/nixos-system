import { expect, test } from "bun:test";
import { browser, keys, settle } from "./prompt-browser.component.test-double.ts";

test("character selections copy exact graphemes, CRLF, and control bytes", async () => {
  const text = "é👩‍💻界\r\n\x1b[31mend\n";
  const copied: string[] = [];
  const { component } = browser(text, (copiedText) => {
    copied.push(copiedText);
  });
  keys(component, "v", "l", "y");
  await settle();
  expect(copied).toEqual(["é👩‍💻"]);
  expect(component.navigation.anchor).toEqual({ found: false });
  keys(component, "g", "g", "v", "G", "y");
  await settle();
  expect(copied[1]).toBe(text);
  expect(component.render(100).join("\n")).not.toContain("\x1b[31m");
  expect(component.render(100).join("\n")).toContain("�[31m");
});

test("line selection and yy retain whitespace and exact newline endings", async () => {
  const text = "  first\r\nsecond\nlast";
  const copied: string[] = [];
  const { component } = browser(text, (copiedText) => {
    copied.push(copiedText);
  });
  keys(component, "y", "y");
  await settle();
  keys(component, "V", "j", "y");
  await settle();
  expect(copied).toEqual(["  first\r\n", "  first\r\nsecond\n"]);
  keys(component, "G", "g", "g", "y", "G");
  await settle();
  expect(copied[2]).toBe(text);
});

test("clipboard failures keep the selection and allow a retry", async () => {
  let fail = true;
  const copied: string[] = [];
  const { component } = browser("raw\ntext", async (copiedText) => {
    if (fail) throw new Error("unavailable");
    copied.push(copiedText);
  });
  keys(component, "v", "l", "y");
  await settle();
  expect(component.render(100).join("\n")).toContain("Copy failed");
  expect(component.navigation.selectedText()).toEqual({ found: true, text: "ra" });
  fail = false;
  keys(component, "y");
  await settle();
  expect(copied).toEqual(["ra"]);
  expect(component.render(100).join("\n")).toContain("Copied 2 characters");
});
