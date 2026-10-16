import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { rainbow } from "pi-powerline-footer/theme.ts";

interface RecordedRequest {
  readonly fast: boolean;
  readonly options: Record<string, unknown>;
}

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

interface FakeContext {
  readonly hasUI: boolean;
  model: FakeModel;
  readonly sessionManager: { readonly getBranch: () => FakeEntry[] };
  readonly ui: {
    readonly setStatus: (key: string, text: string | undefined) => void;
    readonly notify: (text: string) => void;
    readonly select: (title: string) => Promise<string | undefined>;
  };
}

type FakeEventHandler = (event: unknown, ctx: FakeContext) => unknown;

const requests: RecordedRequest[] = [];

mock.module("@earendil-works/pi-ai/api/openai-codex-responses", () => ({
  stream: (_model: unknown, _context: unknown, options: Record<string, unknown>) =>
    requests.push({ fast: true, options }),
  streamSimple: (_model: unknown, _context: unknown, options: Record<string, unknown>) =>
    requests.push({ fast: false, options }),
}));

const { default: extension } = await import("./index.ts");
const codexDirectory = mkdtempSync(join(tmpdir(), "pi-fast-mode-"));
const previousCodexHome = process.env.CODEX_HOME;
const previousStateHome = process.env.XDG_STATE_HOME;
const stateFile = join(codexDirectory, "pi", "codex-fast-mode.json");
const ANSI_ESCAPE = String.fromCharCode(27);
const ANSI_PATTERN = new RegExp(`${ANSI_ESCAPE}\\[[0-9;]*m`, "g");
process.env.CODEX_HOME = codexDirectory;
process.env.XDG_STATE_HOME = codexDirectory;
writeFileSync(
  join(codexDirectory, "models_cache.json"),
  JSON.stringify({
    models: [{ slug: "test-fast-model", service_tiers: [{ id: "priority" }] }],
  }),
);

beforeEach(() => rmSync(join(codexDirectory, "pi"), { recursive: true, force: true }));

afterAll(() => {
  if (previousCodexHome === undefined) delete process.env.CODEX_HOME;
  else process.env.CODEX_HOME = previousCodexHome;
  if (previousStateHome === undefined) delete process.env.XDG_STATE_HOME;
  else process.env.XDG_STATE_HOME = previousStateHome;
  rmSync(codexDirectory, { recursive: true, force: true });
});

function createFastModeRuntime() {
  const handlers = new Map<string, FakeEventHandler>();
  const entries: FakeEntry[] = [];
  let command: { handler: (args: string, ctx: FakeContext) => Promise<void> } | undefined;
  let provider:
    | { streamSimple: (model: FakeModel, context: unknown, options?: Record<string, unknown>) => unknown }
    | undefined;
  let shortcut: { handler: (ctx: FakeContext) => Promise<void> } | undefined;
  let shortcutKey: string | undefined;
  const notifications: string[] = [];
  let menuTitle: string | undefined;
  let status: string | undefined;
  let selection: string | undefined = "On";
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
      setStatus: (_key: string, text: string | undefined) => {
        status = text;
      },
      notify: (text: string) => notifications.push(text),
      select: async (title: string) => {
        menuTitle = title;
        return selection;
      },
    },
  };
  // The fake implements only the ExtensionAPI members this extension calls.
  extension({
    on: (event: string, handler: FakeEventHandler) => handlers.set(event, handler),
    registerProvider: (_name: string, config: typeof provider) => {
      provider = config;
    },
    registerCommand: (_name: string, config: typeof command) => {
      command = config;
    },
    registerShortcut: (key: string, config: typeof shortcut) => {
      shortcutKey = key;
      shortcut = config;
    },
    appendEntry: (customType: string, data: unknown) => entries.push({ type: "custom", customType, data }),
  } as unknown as ExtensionAPI);

  function requireHandler<T>(value: T | undefined, name: string): T {
    if (value === undefined) throw new Error(`${name} was not registered`);
    return value;
  }

  return {
    ctx,
    entries,
    get status() {
      return status;
    },
    get label() {
      return status?.replace(ANSI_PATTERN, "");
    },
    get menuTitle() {
      return menuTitle;
    },
    shortcutKey,
    notifications,
    toggle: () => requireHandler(shortcut, "shortcut").handler(ctx),
    select: (value: string | undefined) => {
      selection = value;
    },
    emit: (event: string) => handlers.get(event)?.({}, ctx),
    command: (args: string) => requireHandler(command, "command").handler(args, ctx),
    request: (options: Record<string, unknown> = { apiKey: "test-key" }) =>
      requireHandler(provider, "provider").streamSimple(ctx.model, { messages: [] }, options),
  };
}

function readSavedPreference(): unknown {
  return JSON.parse(readFileSync(stateFile, "utf8"));
}

test("the visible menu toggles priority options without usage notifications", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  expect(harness.status).toBeUndefined();
  harness.request();
  expect(requests.at(-1)?.fast).toBe(false);
  await harness.command("");
  expect(harness.label).toBe("fast");
  harness.request({ apiKey: "test-key", reasoning: "off", sessionId: "test-session", transport: "sse" });
  expect(requests.at(-1)).toMatchObject({
    fast: true,
    options: {
      serviceTier: "priority",
      sessionId: "test-session",
      transport: "sse",
      maxTokens: 8192,
    },
  });
  expect(requests.at(-1)?.options.reasoningEffort).toBeUndefined();
  harness.emit("session_start");
  expect(harness.label).toBe("fast");
  await harness.command("off");
  harness.request();
  expect(requests.at(-1)?.fast).toBe(false);
  harness.select(undefined);
  await harness.command("");
  expect(harness.status).toBeUndefined();
  expect(harness.menuTitle).toBe("Codex fast mode");
  expect(harness.notifications).toEqual([]);
});

test("the fast badge uses the high-reasoning rainbow gradient", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  await harness.command("on");

  expect(harness.label).toBe("fast");
  expect(harness.status).toBe(rainbow("fast"));
  expect(harness.status).toStartWith("\u001b[38;2;178;129;214m");
  expect(harness.status).toEndWith("\u001b[0m");
});

test("the shortcut persists both choices across fresh extension instances", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  expect(harness.shortcutKey).toBe("ctrl+alt+f");
  await harness.toggle();
  expect(harness.label).toBe("fast");
  expect(harness.status).toContain("\u001b[38;2;");
  expect(readSavedPreference()).toEqual({ enabled: true });

  const nextSession = createFastModeRuntime();
  nextSession.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: false } });
  nextSession.emit("session_start");
  expect(nextSession.label).toBe("fast");
  nextSession.emit("session_tree");
  expect(nextSession.label).toBe("fast");
  nextSession.request();
  expect(requests.at(-1)?.fast).toBe(true);
  await nextSession.toggle();
  expect(nextSession.status).toBeUndefined();
  expect(readSavedPreference()).toEqual({ enabled: false });

  const offSession = createFastModeRuntime();
  offSession.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: true } });
  offSession.emit("session_start");
  expect(offSession.status).toBeUndefined();
  offSession.request();
  expect(requests.at(-1)?.fast).toBe(false);
});

test("missing or invalid preferences fall back to validated session entries", () => {
  const harness = createFastModeRuntime();
  harness.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: true } });
  harness.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: "false" } });
  harness.emit("session_start");
  expect(harness.label).toBe("fast");

  mkdirSync(join(codexDirectory, "pi"));
  writeFileSync(stateFile, "invalid json");
  harness.emit("session_start");
  expect(harness.label).toBe("fast");
  writeFileSync(stateFile, JSON.stringify({ enabled: "true" }));
  harness.entries.length = 0;
  harness.emit("session_start");
  expect(harness.status).toBeUndefined();
});

test("a failed preference write leaves fast mode unchanged", async () => {
  writeFileSync(join(codexDirectory, "pi"), "not a directory");
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  await harness.toggle();
  expect(harness.status).toBeUndefined();
  expect(harness.entries).toEqual([]);
  expect(harness.notifications).toEqual(["Could not save the fast-mode preference. Fast mode was not changed."]);
  harness.request();
  expect(requests.at(-1)?.fast).toBe(false);
});

test("unsupported models never request priority, even with a saved on preference", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  await harness.command("on");
  harness.ctx.model.id = "unsupported";
  harness.emit("model_select");
  expect(harness.status).toBeUndefined();
  harness.request();
  expect(requests.at(-1)?.fast).toBe(false);
  harness.ctx.model.id = "test-fast-model";
  harness.emit("model_select");
  expect(harness.label).toBe("fast");
  harness.ctx.model.id = "unsupported";
  harness.emit("model_select");
  await harness.toggle();
  await harness.command("on");
  expect(harness.entries.at(-1)).toMatchObject({ data: { enabled: false } });
  harness.ctx.model.id = "test-fast-model";
  harness.emit("model_select");
  expect(harness.status).toBeUndefined();
  await harness.command("invalid");
  expect(harness.status).toBeUndefined();
  harness.entries.length = 0;
  harness.emit("session_tree");
  expect(harness.status).toBeUndefined();
});
