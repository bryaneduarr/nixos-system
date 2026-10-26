import { expect, test } from "bun:test";
import {
  TURN_DIVIDER_RENDERER_KEY,
  TURN_HISTORY_TOGGLE_SHORTCUT,
  TURN_REFRESH_WIDGET_KEY,
} from "../../../constants/transcript/turn/turn-view.constant.ts";
import { turnView } from "../../../stores/transcript/turn-view.store.ts";
import type { TurnHistoryApi } from "../../../types/transcript/turn/turn-history-api.interface.ts";
import type { TurnHistoryContext } from "../../../types/transcript/turn/turn-history-context.interface.ts";
import { installTurnHistory } from "./install-turn-history.service.ts";

type RegisteredHandler =
  | ((event: unknown, ctx: TurnHistoryContext) => void)
  | (() => { readonly action: "continue" })
  | (() => void);

const plainTheme = { fg: (_color: string, text: string): string => text };

function required<T>(values: ReadonlyMap<string, T>, name: string): T {
  const value = values.get(name);
  if (value === undefined) throw new Error(`Missing ${name}`);
  return value;
}

function installed(mode: string) {
  const widgetKeys: string[] = [];
  const handlers = new Map<string, RegisteredHandler>();
  const shortcuts = new Map<string, (ctx: TurnHistoryContext) => void>();
  const ctx: TurnHistoryContext = {
    mode,
    ui: { theme: plainTheme, setWidget: (key) => void widgetKeys.push(key) },
  };
  const pi: TurnHistoryApi = {
    on: (event: "session_start" | "input" | "session_shutdown", handler: RegisteredHandler) => {
      handlers.set(event, handler);
    },
    registerShortcut: (key, options) => {
      shortcuts.set(key, options.handler);
    },
  };
  installTurnHistory(pi);
  const fire = (event: string) => required(handlers, event)({}, ctx);
  return { ctx, widgetKeys, shortcuts, fire };
}

test("starting a session hides history and publishes the divider drawing function", () => {
  const { fire } = installed("tui");
  turnView.focus(4);
  turnView.toggleHidden();
  fire("session_start");
  expect(turnView.current()).toEqual({ hidden: true, turnsFromLatest: 0 });
  const render = Reflect.get(globalThis, TURN_DIVIDER_RENDERER_KEY);
  expect(typeof render).toBe("function");
  expect(String(render({ direction: "later", hiddenCount: 2, width: 60 })[0])).toContain("2 later turns hidden");
  fire("session_shutdown");
  expect(Reflect.get(globalThis, TURN_DIVIDER_RENDERER_KEY)).toBeUndefined();
});

test("a session outside the terminal interface publishes nothing", () => {
  const { fire } = installed("rpc");
  fire("session_start");
  expect(Reflect.get(globalThis, TURN_DIVIDER_RENDERER_KEY)).toBeUndefined();
});

test("sending input returns the view to the latest turn", () => {
  const { fire } = installed("tui");
  turnView.focus(3);
  turnView.toggleHidden();
  expect(fire("input")).toEqual({ action: "continue" });
  expect(turnView.current()).toEqual({ hidden: true, turnsFromLatest: 0 });
});

test("the shortcut toggles the history and redraws the transcript", () => {
  const { ctx, shortcuts, widgetKeys } = installed("tui");
  turnView.reset();
  const toggle = required(shortcuts, TURN_HISTORY_TOGGLE_SHORTCUT);
  toggle(ctx);
  expect(turnView.current().hidden).toBe(false);
  toggle(ctx);
  expect(turnView.current().hidden).toBe(true);
  expect(widgetKeys).toEqual(Array(4).fill(TURN_REFRESH_WIDGET_KEY));
});
