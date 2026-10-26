import { expect, test } from "bun:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import type { ClipboardWriter } from "../../../types/prompts/input/clipboard-writer.interface.ts";
import type { PromptOverlayOptions } from "../../../types/prompts/view/prompt-overlay-options.interface.ts";
import type { PromptPanel } from "../../../types/prompts/view/prompt-panel.interface.ts";
import type { PromptBrowserFactory, PromptViewerUi } from "../../../types/prompts/view/prompt-viewer-ui.interface.ts";
import type { SplitViewTheme } from "../../../types/split-view/split-view-theme.interface.ts";
import { requireElement } from "../install/require-element.test-double.ts";
import { viewPrompt } from "./view-prompt.service.ts";

const plainTheme: SplitViewTheme = {
  fg: (_color, text) => text,
  bg: (_color, text) => text,
  bold: (text) => text,
};

const unusedClipboard: ClipboardWriter = () => {};

test("viewer scrolls the complete prompt, resizes, and closes without editing", async () => {
  const panels: PromptPanel[] = [];
  let renders = 0;
  const terminal = { rows: 24 };
  const text = Array.from({ length: 20 }, (_, index) => `line ${index}`).join("\n");
  const ui: PromptViewerUi = {
    custom: <T>(factory: PromptBrowserFactory<T>) =>
      new Promise<T>((resolve) => {
        panels.push(factory({ terminal, requestRender: () => renders++ }, plainTheme, {}, resolve));
      }),
  };
  const viewing = viewPrompt({
    ui,
    collections: { prompts: [{ text, label: "Latest", turn: { kind: "turn", turnsFromLatest: 0 } }], outputs: [] },
    clipboard: unusedClipboard,
    selection: { kind: "read-only" },
  });
  const panel = requireElement(panels, 0, "viewer did not open");
  expect(panel.render(40).join("\n")).toContain("line 0");
  expect(panel.render(40).join("\n")).not.toContain("line 19");
  panel.handleInput("\x1b[F");
  expect(panel.render(40).join("\n")).toContain("line 19");
  panel.handleInput("\x1b[H");
  expect(panel.render(40).join("\n")).toContain("line 0");
  panel.handleInput("\x1b[6~");
  expect(panel.render(40).join("\n")).toContain("line 1");
  terminal.rows = 6;
  panel.invalidate();
  for (const line of panel.render(5)) expect(visibleWidth(line)).toBeLessThanOrEqual(5);
  expect(renders).toBe(3);
  panel.handleInput("\x1b");
  await viewing;
});

test("viewer opens a centered overlay focused on the first item without editor writes", async () => {
  const panels: PromptPanel[] = [];
  const overlays: PromptOverlayOptions[] = [];
  const draft = "unsent\nraw";
  const ui: PromptViewerUi = {
    custom: <T>(factory: PromptBrowserFactory<T>, options: PromptOverlayOptions) => {
      overlays.push(options);
      return new Promise<T>((resolve) => {
        panels.push(factory({ terminal: { rows: 24 }, requestRender: () => {} }, plainTheme, {}, resolve));
      });
    },
  };
  const viewing = viewPrompt({
    ui,
    collections: { prompts: [{ text: draft, label: "Draft", turn: { kind: "draft" } }], outputs: [] },
    clipboard: unusedClipboard,
    selection: { kind: "read-only" },
  });
  expect(overlays).toEqual([
    {
      overlay: true,
      overlayOptions: { anchor: "center", width: "92%", maxHeight: "88%", margin: 1 },
    },
  ]);
  const panel = requireElement(panels, 0, "viewer did not open");
  expect(panel.render(100).join("\n")).toContain("◆ Prompts");
  expect(panel.render(100).join("\n")).toContain("unsent");
  panel.handleInput("\x1b");
  await viewing;
});
