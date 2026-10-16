import { expect, test } from "bun:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { collectPrompts } from "../agent-configuration/harness/ui/prompts/collection.ts";
import { cursorRow, moveVertical, wrapPrompt } from "../agent-configuration/harness/ui/prompts/layout.ts";
import { PromptNavigation } from "../agent-configuration/harness/ui/prompts/model.ts";
import { type ClipboardWriter, PromptBrowser, viewPrompt } from "../agent-configuration/harness/ui/prompts/viewer.ts";

const theme: any = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
};

function browser(text: string, clipboard: ClipboardWriter = () => {}) {
  let closed = 0;
  let renders = 0;
  const tui: any = { terminal: { rows: 24 }, requestRender: () => renders++ };
  const component = new PromptBrowser(
    [
      { text, label: "Draft" },
      { text: "older", label: "1." },
    ],
    tui,
    theme,
    () => closed++,
    clipboard,
  );
  component.render(100);
  return { component, tui, closed: () => closed, renders: () => renders };
}

function keys(component: PromptBrowser, ...inputs: string[]) {
  for (const input of inputs) component.handleInput(input);
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

test("character selections copy exact graphemes, CRLF, and control bytes", async () => {
  const text = "e\u0301👩‍💻界\r\n\x1b[31mend\n";
  const copied: string[] = [];
  const { component } = browser(text, (value) => {
    copied.push(value);
  });
  keys(component, "v", "l", "y");
  await settle();
  expect(copied).toEqual(["e\u0301👩‍💻"]);
  expect(component.navigation.anchor).toBeUndefined();
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

test("reverse character and line ranges include both endpoints", () => {
  const navigation = new PromptNavigation("a🙂\nb界\nc");
  navigation.move(4);
  navigation.toggleSelection("character");
  navigation.move(1);
  expect(navigation.selectedText()).toBe("🙂\nb界");
  navigation.toggleSelection("line");
  expect(navigation.selectedText()).toBe("a🙂\nb界\n");
});

test("escape cancels a selection before closing and ctrl+c always closes", () => {
  const first = browser("text");
  keys(first.component, "v", "\x1b");
  expect(first.closed()).toBe(0);
  expect(first.component.navigation.anchor).toBeUndefined();
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
  expect(component.navigation.selectedText()).toBe("ra");
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
  expect(component.navigation.anchor).toBeUndefined();
  keys(component, "k", "\t", "l");
  expect(component.navigation.text).toBe("draft");
  expect(component.navigation.cursor).toBe(1);
});

test("wrapping retains source indexes for combining marks, emoji, tabs and newlines", () => {
  const navigation = new PromptNavigation("a界e\u0301👩‍💻\t\r\nb");
  for (const width of [1, 2, 3, 12]) {
    const rows = wrapPrompt(navigation.units, width);
    expect(rows.flat().map((cell) => cell.index)).toEqual(navigation.units.map((_, index) => index));
    for (const row of rows) expect(visibleWidth(row.map((cell) => cell.text).join(""))).toBeLessThanOrEqual(width);
    navigation.move(0);
    moveVertical(navigation, rows, 1);
    expect(cursorRow(rows, navigation.cursor)).toBe(1);
  }
});

test("resize preserves raw selections and bounds both dimensions", () => {
  const { component, tui } = browser("界🙂e\u0301\t".repeat(100) + "\nend");
  keys(component, "v", "l", "l");
  const selected = component.navigation.selectedText();
  for (const height of [1, 2, 5, 12, 30]) {
    tui.terminal.rows = height;
    for (const width of [0, 1, 2, 5, 30, 63, 64, 100]) {
      component.invalidate();
      const lines = component.render(width);
      expect(lines.length).toBeLessThanOrEqual(height);
      for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
      expect(component.navigation.selectedText()).toBe(selected);
    }
  }
});

test("detail motions navigate words, raw line edges, pages and message edges", () => {
  const { component } = browser("one two\n" + Array.from({ length: 40 }, (_, index) => `row ${index}`).join("\n"));
  keys(component, "w");
  expect(component.navigation.units[component.navigation.cursor].start).toBe(4);
  keys(component, "b");
  expect(component.navigation.cursor).toBe(0);
  keys(component, "$");
  expect(component.navigation.units[component.navigation.cursor].text).toBe("o");
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

test("collection uses only the current branch and preserves an unsent whitespace draft", () => {
  const draft = " \n\te\u0301";
  const entries = [
    { type: "message", message: { role: "user", content: "earlier" } },
    { type: "message", message: { role: "assistant", content: "excluded" } },
    { type: "custom", message: { role: "user", content: "excluded custom" } },
    {
      type: "message",
      message: {
        role: "user",
        content: [{ type: "text", text: "latest" }, { type: "image" }, { type: "text", text: "raw" }],
      },
    },
  ];
  const ctx: any = { sessionManager: { getBranch: () => entries }, ui: { getEditorText: () => draft } };
  expect(collectPrompts(ctx).map((item) => item.text)).toEqual([draft, "latest\nraw", "earlier"]);
  expect(ctx.ui.getEditorText()).toBe(draft);
  expect(entries[3].message.content).toEqual([
    { type: "text", text: "latest" },
    { type: "image" },
    { type: "text", text: "raw" },
  ]);
  ctx.sessionManager.getBranch = () => [];
  expect(collectPrompts(ctx)).toEqual([{ label: "Draft", text: draft }]);
});

test("viewer opens a centered overlay focused on the first item without editor writes", async () => {
  let component: PromptBrowser;
  let options: any;
  const draft = "unsent\nraw";
  const ctx: any = {
    ui: {
      custom: (factory: any, configuration: any) => {
        options = configuration;
        return new Promise((resolve) => {
          component = factory({ terminal: { rows: 24 }, requestRender: () => {} }, theme, {}, resolve);
        });
      },
      getEditorText: () => draft,
      setEditorText: () => {
        throw new Error("must not write editor");
      },
    },
  };
  const viewing = viewPrompt(ctx, [{ text: draft, label: "Draft" }]);
  expect(options.overlay).toBe(true);
  expect(options.overlayOptions.anchor).toBe("center");
  expect(component!.focus).toBe("detail");
  expect(component!.render(100).join("\n")).toContain("unsent");
  component!.handleInput("\x1b");
  await viewing;
  expect(ctx.ui.getEditorText()).toBe(draft);
});
