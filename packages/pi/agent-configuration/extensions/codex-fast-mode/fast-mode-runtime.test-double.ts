import type { ExtensionAPI, ExtensionUIContext } from "@earendil-works/pi-coding-agent";
import "./fast-mode-stream.test-double.ts";

interface FakeModel {
  api: string;
  provider: string;
  id: string;
  readonly maxTokens: number;
  readonly contextWindow: number;
}

interface FakeEntry {
  readonly type: "custom";
  readonly customType: string;
  data: unknown;
}

type StatusText = Parameters<ExtensionUIContext["setStatus"]>[1];

type MenuSelection = Awaited<ReturnType<ExtensionUIContext["select"]>>;

interface FakeContext {
  readonly hasUI: boolean;
  model: FakeModel;
  readonly sessionManager: { readonly getBranch: () => FakeEntry[] };
  readonly ui: {
    readonly setStatus: (key: string, text: StatusText) => void;
    readonly notify: (text: string) => void;
    readonly select: (title: string) => Promise<MenuSelection>;
  };
}

type FakeEventHandler = (event: unknown, ctx: FakeContext) => unknown;

interface CommandConfig {
  readonly handler: (args: string, ctx: FakeContext) => Promise<void>;
}

interface ShortcutConfig {
  readonly handler: (ctx: FakeContext) => Promise<void>;
}

interface ProviderConfig {
  readonly streamSimple: (model: FakeModel, context: unknown, options: Record<string, unknown>) => unknown;
}

const ANSI_ESCAPE = String.fromCharCode(27);
const ANSI_PATTERN = new RegExp(`${ANSI_ESCAPE}\\[[0-9;]*m`, "g");

const { default: extension } = await import("./codex-fast-mode.extension.ts");

function registrationSlot<T>(name: string): { set: (value: T) => void; require: () => T } {
  const registrations: T[] = [];
  return {
    set: (value) => {
      registrations.push(value);
    },
    require: () => {
      const registration = registrations.at(-1);
      if (registration === undefined) throw new Error(`${name} was not registered`);
      return registration;
    },
  };
}

export function createFastModeRuntime() {
  const handlers = new Map<string, FakeEventHandler>();
  const entries: FakeEntry[] = [];
  const commands = registrationSlot<CommandConfig>("command");
  const providers = registrationSlot<ProviderConfig>("provider");
  const shortcuts = registrationSlot<ShortcutConfig>("shortcut");
  const shortcutKeys: string[] = [];
  const notifications: string[] = [];
  const menuTitles: string[] = [];
  let status: StatusText;
  let selection: MenuSelection = "On";
  const model: FakeModel = {
    api: "openai-codex-responses",
    provider: "openai-codex",
    id: "test-fast-model",
    maxTokens: 8192,
    contextWindow: 32768,
  };
  const ctx: FakeContext = {
    hasUI: true,
    model,
    sessionManager: { getBranch: () => entries },
    ui: {
      setStatus: (_key: string, text: StatusText) => {
        status = text;
      },
      notify: (text: string) => notifications.push(text),
      select: async (title: string) => {
        menuTitles.push(title);
        return selection;
      },
    },
  };
  // The fake implements only the ExtensionAPI members this extension calls.
  extension({
    on: (event: string, handler: FakeEventHandler) => handlers.set(event, handler),
    registerProvider: (_name: string, config: ProviderConfig) => providers.set(config),
    registerCommand: (_name: string, config: CommandConfig) => commands.set(config),
    registerShortcut: (key: string, config: ShortcutConfig) => {
      shortcutKeys.push(key);
      shortcuts.set(config);
    },
    appendEntry: (customType: string, data: unknown) => entries.push({ type: "custom", customType, data }),
  } as unknown as ExtensionAPI);

  return {
    ctx,
    entries,
    get status() {
      return status;
    },
    get label() {
      return status === undefined ? undefined : status.replace(ANSI_PATTERN, "");
    },
    get menuTitle() {
      return menuTitles.at(-1);
    },
    get shortcutKey() {
      return shortcutKeys.at(-1);
    },
    notifications,
    toggle: () => shortcuts.require().handler(ctx),
    select: (value: MenuSelection) => {
      selection = value;
    },
    emit: (event: string) => {
      const handler = handlers.get(event);
      return handler === undefined ? undefined : handler({}, ctx);
    },
    command: (args: string) => commands.require().handler(args, ctx),
    request: (options: Record<string, unknown> = { apiKey: "test-key" }) =>
      providers.require().streamSimple(ctx.model, { messages: [] }, options),
  };
}
