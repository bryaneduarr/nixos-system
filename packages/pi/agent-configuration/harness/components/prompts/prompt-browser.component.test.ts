import { expect, test } from "bun:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import type { ClipboardWriter } from "../../types/prompts/clipboard-writer.interface.ts";
import type { PromptBrowserHost } from "../../types/prompts/prompt-browser-host.interface.ts";
import type { PromptTheme } from "../../types/prompts/prompt-theme.interface.ts";
import { PromptBrowser } from "./prompt-browser.component.ts";

const plainTheme: PromptTheme = {
  fg: (_color, text) => text,
  bg: (_color, text) => text,
};

function browser(text: string, clipboard: ClipboardWriter = () => {}) {
  let closed = 0;
  let renders = 0;
  const terminal = { rows: 24 };
  const host: PromptBrowserHost = {
    terminal,
    requestRender: () => {
      renders++;
    },
  };
  const component = new PromptBrowser(
    [
      { text, label: "Draft" },
      { text: "older", label: "1." },
    ],
    host,
    plainTheme,
    () => {
      closed++;
    },
    clipboard,
  );
  component.render(100);
  return { component, terminal, closed: () => closed, renders: () => renders };
}

function keys(component: PromptBrowser, ...inputs: string[]) {
  for (const input of inputs) component.handleInput(input);
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

test("character selections copy exact graphemes, CRLF, and control bytes", async () => {
  const text = "é👩‍💻界\r\n\x1b[31mend\n";
  const copied: string[] = [];
  const { component } = browser(text, (value) => {
    copied.push(value);
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
  const { component } = browser(text, (value) => {
    copied.push(value);
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

test("clipboard failures keep the selection and allow a retry", async () => {
  let fail = true;
  const copied: string[] = [];
  const { component } = browser("raw\ntext", async (value) => {
    if (fail) throw new Error("unavailable");
    copied.push(value);
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

test("detail motions navigate words, raw line edges, pages and message edges", () => {
  const { component } = browser(`one two\n${Array.from({ length: 40 }, (_, index) => `row ${index}`).join("\n")}`);
  keys(component, "w");
  expect(component.navigation.units[component.navigation.cursor]?.start).toBe(4);
  keys(component, "b");
  expect(component.navigation.cursor).toBe(0);
  keys(component, "$");
  expect(component.navigation.units[component.navigation.cursor]?.text).toBe("o");
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
