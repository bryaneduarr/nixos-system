import { join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { KeybindingDefinitions } from "@earendil-works/pi-tui";

type EventHandler = (event: unknown, ctx: ExtensionContext) => unknown;
type ShortcutHandler = (ctx: ExtensionContext) => Promise<void>;
type CommandHandler = (args: string, ctx: ExtensionContext) => Promise<void>;

export type InstallFlags = { notificationFails: boolean; pendingRenames: number; createFails: boolean };

export type InstallState = {
  idle: boolean;
  editor: string;
  shutdowns: number;
  cleanups: number;
  entries: unknown[];
  terminalInput: (data: string) => void;
  selection: "self" | "new" | "cancel";
  menuSelections: number;
  projectSelections: number;
};

export const ENVIRONMENT_KEYS = [
  "HERDR_ENV",
  "HERDR_SOCKET_PATH",
  "PI_MANAGED_SESSION",
  "PI_SESSION_REGISTRY",
] as const;

export function createPasteImageDefinitions(): KeybindingDefinitions {
  return { "app.clipboard.pasteImage": { description: "Paste", defaultKeys: "ctrl+v" } };
}

export function handlerNamed<T>(handlers: Map<string, T>, name: string): T {
  const handler = handlers.get(name);
  if (handler === undefined) throw new Error(`Missing handler ${name}`);
  return handler;
}

export function registerFakeApi() {
  const events = new Map<string, EventHandler>();
  const shortcuts = new Map<string, ShortcutHandler>();
  const commands = new Map<string, CommandHandler>();
  // Test double implements only the registration methods the installer calls.
  const api = {
    on: (name: string, handler: EventHandler) => events.set(name, handler),
    registerShortcut: (name: string, spec: { handler: ShortcutHandler }) => shortcuts.set(name, spec.handler),
    registerCommand: (name: string, spec: { handler: CommandHandler }) => commands.set(name, spec.handler),
  } as unknown as ExtensionAPI;
  return { api, events, shortcuts, commands };
}

function asExtensionContext(fake: object): ExtensionContext {
  return fake as unknown as ExtensionContext;
}

export function createInstallState(): InstallState {
  return {
    idle: true,
    editor: "",
    shutdowns: 0,
    cleanups: 0,
    entries: [{ type: "message", message: { role: "custom", content: "startup" } }],
    terminalInput: () => {},
    selection: "cancel",
    menuSelections: 0,
    projectSelections: 0,
  };
}

export function createInstallContext(root: string, state: InstallState, notifications: string[]): ExtensionContext {
  // Test double implements only the context members the installer reads.
  return asExtensionContext({
    mode: "tui",
    cwd: root,
    signal: undefined,
    isIdle: () => state.idle,
    hasPendingMessages: () => false,
    getContextUsage: () => undefined,
    shutdown: () => {
      state.shutdowns++;
    },
    ui: {
      getEditorText: () => state.editor,
      notify: (message: string) => notifications.push(message),
      onTerminalInput: (handler: (data: string) => void) => {
        state.terminalInput = handler;
        return () => {};
      },
    },
    sessionManager: {
      getEntries: () => state.entries,
      getSessionId: () => "session",
      getSessionName: () => "test",
      getSessionFile: () => join(root, "session.jsonl"),
    },
  });
}

export function createRenumberingContext(root: string): ExtensionContext {
  // Test double implements only the context members the installer reads.
  return asExtensionContext({
    mode: "tui",
    cwd: root,
    isIdle: () => true,
    hasPendingMessages: () => false,
    getContextUsage: () => undefined,
    ui: { getEditorText: () => "", onTerminalInput: () => () => {}, notify: () => {} },
    sessionManager: { getEntries: () => [], getSessionId: () => "current", getSessionFile: () => undefined },
  });
}

export function environmentFor(root: string, token: string): Record<string, string> {
  return {
    HERDR_ENV: "1",
    HERDR_SOCKET_PATH: join(root, "herdr.sock"),
    PI_MANAGED_SESSION: token,
    PI_SESSION_REGISTRY: root,
  };
}

export function applyEnvironment(values: Record<string, string>): void {
  for (const key of Object.keys(values)) {
    const value = values[key];
    if (value !== undefined) process.env[key] = value;
  }
}

export function restoreEnvironment(keys: readonly string[], previous: NodeJS.ProcessEnv): void {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
}
