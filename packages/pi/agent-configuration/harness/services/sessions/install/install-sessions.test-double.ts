import { join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { KeybindingDefinitions } from "@earendil-works/pi-tui";

type EventHandler = (event: unknown, ctx: ExtensionContext) => unknown;

type ShortcutHandler = (ctx: ExtensionContext) => Promise<void>;

type CommandHandler = (args: string, ctx: ExtensionContext) => Promise<void>;

/** Switches that make the fake Herdr fail or delay specific commands. */
export interface InstallFlags {
  /** Whether completion notifications fail. */
  notificationFails: boolean;
  /** Number of agent renames that report a pending launch before succeeding. */
  pendingRenames: number;
  /** Whether creating a sibling session fails. */
  createFails: boolean;
}

/** Observable state of the fake Pi context and session dependencies. */
export interface InstallState {
  /** Whether the fake agent is idle. */
  idle: boolean;
  /** Text of the fake editor draft. */
  editor: string;
  /** Number of shutdown requests. */
  shutdowns: number;
  /** Number of scheduled cleanups. */
  cleanups: number;
  /** Entries of the fake session manager. */
  entries: unknown[];
  /** Latest terminal input listener that the installer registered. */
  terminalInput: (data: string) => void;
  /** Choice the fake session menu returns. */
  selection: "self" | "new" | "cancel";
  /** Number of times the session menu was shown. */
  menuSelections: number;
  /** Number of times the project picker was shown. */
  projectSelections: number;
}

export const ENVIRONMENT_KEYS = [
  "HERDR_ENV",
  "HERDR_SOCKET_PATH",
  "PI_MANAGED_SESSION",
  "PI_SESSION_REGISTRY",
] as const;

export function createPasteImageDefinitions(): KeybindingDefinitions {
  return { "app.clipboard.pasteImage": { description: "Paste", defaultKeys: "ctrl+v" } };
}

export function registerFakeApi() {
  const events = new Map<string, EventHandler>();
  const shortcuts = new Map<string, ShortcutHandler>();
  const commands = new Map<string, CommandHandler>();
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
