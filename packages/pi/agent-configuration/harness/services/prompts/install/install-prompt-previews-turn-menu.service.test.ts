import { expect, test } from "bun:test";
import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { TURN_MENU_SHORTCUT, TURN_REFRESH_WIDGET_KEY } from "../../../constants/transcript/turn-view.constant.ts";
import type { PromptContext } from "../../../types/prompts/install/prompt-context.interface.ts";
import type { PromptExtensionApi } from "../../../types/prompts/install/prompt-extension-api.interface.ts";
import type { PromptTheme } from "../../../types/prompts/render/prompt-theme.interface.ts";
import type { PromptPanel } from "../../../types/prompts/view/prompt-panel.interface.ts";
import type { PromptBrowserFactory } from "../../../types/prompts/view/prompt-viewer-ui.interface.ts";
import { turnView } from "../../transcript/turn/shared-turn-view.service.ts";
import { installPromptPreviews } from "./install-prompt-previews.service.ts";

const plainTheme: PromptTheme = {
  fg: (_color, text) => text,
  bg: (_color, text) => text,
  bold: (text) => text,
};

const timestamp = "2026-01-01T00:00:00.000Z";

function requireElement<T>(elements: readonly T[], index: number, message: string): T {
  const element = elements.at(index);
  if (element === undefined) throw new Error(message);
  return element;
}

test("the turn menu focuses the chosen turn and redraws the transcript", async () => {
  const handlers = new Map<string, (ctx: PromptContext) => Promise<void>>();
  const panels: PromptPanel[] = [];
  const widgetKeys: string[] = [];
  const userEntry = (id: string): SessionEntry => ({
    type: "message",
    id,
    parentId: null,
    timestamp,
    message: { role: "user", content: id, timestamp: 1 },
  });
  const ctx: PromptContext = {
    mode: "tui",
    sessionManager: { getBranch: () => [userEntry("first"), userEntry("second"), userEntry("third")] },
    ui: {
      notify: () => {},
      getEditorText: () => "",
      setWidget: (key) => void widgetKeys.push(key),
      custom: <T>(factory: PromptBrowserFactory<T>) =>
        new Promise<T>((resolve) => {
          panels.push(factory({ terminal: { rows: 100 }, requestRender: () => {} }, plainTheme, {}, resolve));
        }),
    },
  };
  const pi: PromptExtensionApi = {
    registerShortcut: (key, options) => void handlers.set(key, options.handler),
    registerCommand: () => {},
  };
  installPromptPreviews(pi);
  turnView.reset();

  const openTurnMenu = handlers.get(TURN_MENU_SHORTCUT);
  if (openTurnMenu === undefined) throw new Error("turn menu not registered");
  const opening = openTurnMenu(ctx);
  const panel = requireElement(panels, 0, "turn menu did not open");
  panel.handleInput("\t");
  panel.handleInput("j");
  panel.handleInput("j");
  panel.handleInput("\r");
  await opening;

  expect(turnView.current()).toEqual({ hidden: true, turnsFromLatest: 2 });
  expect(widgetKeys).toEqual([TURN_REFRESH_WIDGET_KEY, TURN_REFRESH_WIDGET_KEY]);
});
