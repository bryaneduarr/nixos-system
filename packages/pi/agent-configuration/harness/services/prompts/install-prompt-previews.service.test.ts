import { expect, test } from "bun:test";
import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import type { PromptContext } from "../../types/prompts/prompt-context.interface.ts";
import type { PromptExtensionApi, PromptMarkdownContext } from "../../types/prompts/prompt-extension-api.interface.ts";
import type { PromptPanel } from "../../types/prompts/prompt-panel.interface.ts";
import type { PromptTheme } from "../../types/prompts/prompt-theme.interface.ts";
import type { PromptBrowserFactory, PromptOverlayOptions } from "../../types/prompts/prompt-viewer-ui.interface.ts";
import { installPromptPreviews } from "./install-prompt-previews.service.ts";

const plainTheme: PromptTheme = {
  fg: (_color, text) => text,
  bg: (_color, text) => text,
};

const timestamp = "2026-01-01T00:00:00.000Z";

function requireValue<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

test("installation transforms only user display and reads original branch text", async () => {
  const transforms: ((markdown: string, context: PromptMarkdownContext) => string)[] = [];
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
      custom: <T>(factory: PromptBrowserFactory<T>, options: PromptOverlayOptions) => {
        overlays.push(options);
        return new Promise<T>((resolve) => {
          panels.push(factory({ terminal: { rows: 100 }, requestRender: () => {} }, plainTheme, {}, resolve));
        });
      },
    },
  };
  const pi: PromptExtensionApi = {
    registerMarkdownTransformer: (transform) => {
      transforms.push(transform);
    },
    registerShortcut: (key, options) => {
      expect(key).toBe("ctrl+alt+u");
      shortcuts.push(options.handler);
    },
    registerCommand: (name, options) => {
      expect(name).toBe("prompts");
      commands.push(options.handler);
    },
  };
  installPromptPreviews(pi);
  const transform = requireValue(transforms.at(0), "transformer not registered");
  const shortcut = requireValue(shortcuts.at(0), "shortcut not registered");
  const command = requireValue(commands.at(0), "command not registered");

  for (const messageType of ["assistant", "assistant-thinking"]) {
    expect(transform(latest, { messageType, availableWidth: 80 })).toBe(latest);
  }
  expect(transform(latest, { messageType: "user", availableWidth: 80 })).not.toBe(latest);
  const viewing = shortcut(ctx);
  expect(overlays).toHaveLength(1);
  await shortcut(ctx);
  expect(overlays).toHaveLength(1);
  const openedPanel = requireValue(panels.at(0), "viewer did not open");
  expect(openedPanel.render(80).join("\n")).toContain("original");
  openedPanel.handleInput("G");
  expect(openedPanel.render(80).join("\n")).toContain("original");
  openedPanel.handleInput("\x1b");
  await viewing;
  const choosing = command("", ctx);
  await Promise.resolve();
  const chosenPanel = requireValue(panels.at(1), "command did not open the browser");
  chosenPanel.handleInput("\t");
  chosenPanel.handleInput("j");
  expect(chosenPanel.render(80).join("\n")).toContain("earlier");
  chosenPanel.handleInput("\x1b");
  await choosing;
  entries = [];
  await shortcut(ctx);
  expect(notifications).toEqual(["No prompts or draft in this branch."]);
  mode = "rpc";
  await shortcut(ctx);
  expect(notifications).toHaveLength(1);
});
