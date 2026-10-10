import { afterAll, expect, mock, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { fastModelsFromCache, supportsFastMode } from "../agent-configuration/extensions/codex-fast-mode/capabilities";

const requests: { fast: boolean; options: any }[] = [];

mock.module("@earendil-works/pi-ai/api/openai-codex-responses", () => ({
  stream: (_model: any, _context: any, options: any) => requests.push({ fast: true, options }),
  streamSimple: (_model: any, _context: any, options: any) => requests.push({ fast: false, options }),
}));

const { default: extension } = await import("../agent-configuration/extensions/codex-fast-mode");
const codexDirectory = mkdtempSync(join(tmpdir(), "pi-fast-mode-"));
const previousCodexHome = process.env.CODEX_HOME;
process.env.CODEX_HOME = codexDirectory;
writeFileSync(join(codexDirectory, "models_cache.json"), JSON.stringify({
  models: [{ slug: "test-fast-model", service_tiers: [{ id: "priority" }] }],
}));

afterAll(() => {
  if (previousCodexHome === undefined) delete process.env.CODEX_HOME;
  else process.env.CODEX_HOME = previousCodexHome;
  rmSync(codexDirectory, { recursive: true, force: true });
} );

function runtime() {
  const handlers = new Map<string, (event: any, ctx: any) => any>();
  const entries: any[] = [];
  let command: any;
  let provider: any;
  let status: string | undefined;
  let selection: string | undefined = "On";
  const model = {
    api: "openai-codex-responses", provider: "openai-codex", id: "test-fast-model",
    maxTokens: 8192, contextWindow: 32768,
  };
  const ctx = {
    hasUI: true, model,
    sessionManager: { getBranch: () => entries },
    ui: {
      setStatus: (_key: string, text: string) => { status = text; },
      notify: () => {},
      select: async () => selection,
    },
  };
  extension({
    on: (event: string, handler: any) => handlers.set(event, handler),
    registerProvider: (_name: string, config: any) => { provider = config; },
    registerCommand: (_name: string, config: any) => { command = config; },
    appendEntry: (customType: string, data: unknown) => entries.push({ type: "custom", customType, data }),
  } as unknown as ExtensionAPI);

  return {
    ctx, entries,
    get status() { return status; },
    select: (value: string | undefined) => { selection = value; },
    emit: (event: string) => handlers.get(event)?.({}, ctx),
    command: (args: string) => command.handler(args, ctx),
    request: (options: any = { apiKey: "test-key" }) => provider.streamSimple(ctx.model, { messages: [] }, options),
  };
}

test("fast capability detection validates cache tiers and provider API", () => {
  for (const value of [null, {}, { models: null }, { models: [null, 2, {}] }]) {
    expect(fastModelsFromCache(value).size).toBe(0);
  }
  const models = fastModelsFromCache({ models: [
    { slug: "fast", service_tiers: [null, { id: "priority" }] },
    { slug: "slow", service_tiers: [{ id: "default" }] },
  ] });
  expect([...models]).toEqual(["fast"]);
  expect(supportsFastMode({ provider: "openai-codex", api: "openai-codex-responses", id: "fast" } as any, models)).toBe(true);
  expect(supportsFastMode({ provider: "openai", api: "openai-codex-responses", id: "fast" } as any, models)).toBe(false);
  expect(supportsFastMode({ provider: "openai-codex", api: "openai-responses", id: "fast" } as any, models)).toBe(false);
});

test("the visible menu toggles priority options and restores session state", async () => {
  const harness = runtime();
  harness.emit("session_start");
  expect(harness.status).toBe("/fast: off");
  harness.request();
  expect(requests.at(-1)?.fast).toBe(false);
  await harness.command("");
  expect(harness.status).toBe("/fast: on");
  harness.request({ apiKey: "test-key", reasoning: "off", sessionId: "test-session", transport: "sse" });
  expect(requests.at(-1)).toMatchObject({ fast: true, options: {
    serviceTier: "priority", sessionId: "test-session", transport: "sse", maxTokens: 8192,
  } });
  expect(requests.at(-1)?.options.reasoningEffort).toBeUndefined();
  harness.emit("session_start");
  expect(harness.status).toBe("/fast: on");
  await harness.command("off");
  harness.request();
  expect(requests.at(-1)?.fast).toBe(false);
  harness.select(undefined);
  await harness.command("");
  expect(harness.status).toBe("/fast: off");
});

test("unsupported models never request priority, even with a saved on preference", async () => {
  const harness = runtime();
  harness.emit("session_start");
  await harness.command("on");
  harness.ctx.model.id = "unsupported";
  harness.emit("model_select");
  expect(harness.status).toBe("/fast: unavailable");
  harness.request();
  expect(requests.at(-1)?.fast).toBe(false);
  await harness.command("toggle");
  await harness.command("on");
  expect(harness.entries.at(-1).data.enabled).toBe(false);
  harness.ctx.model.id = "test-fast-model";
  harness.emit("model_select");
  expect(harness.status).toBe("/fast: off");
  await harness.command("invalid");
  expect(harness.status).toBe("/fast: off");
  harness.entries.length = 0;
  harness.emit("session_tree");
  expect(harness.status).toBe("/fast: off");
});
