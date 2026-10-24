import { expect, test } from "bun:test";
import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import type { PromptContext } from "../../../types/prompts/install/prompt-context.interface.ts";
import type { PromptExtensionApi } from "../../../types/prompts/install/prompt-extension-api.interface.ts";
import type { PromptOverlayOptions } from "../../../types/prompts/view/prompt-overlay-options.interface.ts";
import type { PromptPanel } from "../../../types/prompts/view/prompt-panel.interface.ts";
import type { PromptBrowserFactory } from "../../../types/prompts/view/prompt-viewer-ui.interface.ts";
import type { SplitViewTheme } from "../../../types/split-view/split-view-theme.interface.ts";
import { installPromptPreviews } from "./install-prompt-previews.service.ts";
import { requireElement } from "./require-element.test-double.ts";

const plainTheme: SplitViewTheme = {
  fg: (_color, text) => text,
  bg: (_color, text) => text,
  bold: (text) => text,
};

const timestamp = "2026-01-01T00:00:00.000Z";

test("installation opens the prompt viewer and browser with original branch text", async () => {
  const shortcuts: ((ctx: PromptContext) => Promise<void>)[] = [];
  const commands: ((args: string, ctx: PromptContext) => Promise<void>)[] = [];
  const panels: PromptPanel[] = [];
  const overlays: PromptOverlayOptions[] = [];
  const latest = "original\n".repeat(30);
  const notifications: string[] = [];
  let mode = "tui";
  let entries: SessionEntry[] = [
    {
      type: "message",
      id: "1",
      parentId: null,
      timestamp,
      message: { role: "user", content: "earlier", timestamp: 1 },
    },
    {
      type: "message",
      id: "2",
      parentId: "1",
      timestamp,
      message: {
        role: "user",
        content: [
          { type: "text", text: latest },
          { type: "image", data: "", mimeType: "image/png" },
        ],
        timestamp: 2,
      },
    },
  ];
  const ctx: PromptContext = {
    get mode() {
      return mode;
    },
    sessionManager: { getBranch: () => entries },
    ui: {
      notify: (message) => {
        notifications.push(message);
      },
      getEditorText: () => "",
      setWidget: () => {},
      custom: <T>(factory: PromptBrowserFactory<T>, options: PromptOverlayOptions) => {
        overlays.push(options);
        return new Promise<T>((resolve) => {
          panels.push(factory({ terminal: { rows: 100 }, requestRender: () => {} }, plainTheme, {}, resolve));
        });
      },
    },
  };
  const pi: PromptExtensionApi = {
    registerShortcut: (key, options) => {
      if (key === "ctrl+alt+u") shortcuts.push(options.handler);
    },
    registerCommand: (name, options) => {
      expect(name).toBe("prompts");
      commands.push(options.handler);
    },
  };
  installPromptPreviews(pi);
  const shortcut = requireElement(shortcuts, 0, "shortcut not registered");
  const command = requireElement(commands, 0, "command not registered");

  const viewing = shortcut(ctx);
  expect(overlays).toHaveLength(1);
  await shortcut(ctx);
  expect(overlays).toHaveLength(1);
  const openedPanel = requireElement(panels, 0, "viewer did not open");
  expect(openedPanel.render(80).join("\n")).toContain("original");
  openedPanel.handleInput("G");
  expect(openedPanel.render(80).join("\n")).toContain("original");
  openedPanel.handleInput("\x1b");
  await viewing;
  const choosing = command("", ctx);
  await Promise.resolve();
  const chosenPanel = requireElement(panels, 1, "command did not open the browser");
  chosenPanel.handleInput("\t");
  chosenPanel.handleInput("j");
  expect(chosenPanel.render(80).join("\n")).toContain("earlier");
  chosenPanel.handleInput("\x1b");
  await choosing;
  entries = [];
  await shortcut(ctx);
  expect(notifications).toEqual(["No prompts, draft, or agent outputs in this branch."]);
  mode = "rpc";
  await shortcut(ctx);
  expect(notifications).toHaveLength(1);
});
