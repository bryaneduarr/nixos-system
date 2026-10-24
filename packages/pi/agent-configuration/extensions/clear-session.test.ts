import { afterAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import clearExtension from "./clear-session.extension.ts";
import { asExtensionApi } from "./clear-session.test-double.ts";
import lastModelExtension from "./last-model/last-model.extension.ts";

const stateHome = mkdtempSync(join(tmpdir(), "pi-clear-test-"));
process.env.XDG_STATE_HOME = stateHome;
afterAll(() => rmSync(stateHome, { recursive: true, force: true }));

interface FakeModel {
  readonly provider: string;
  readonly id: string;
}

type FakeModelLookup = ReturnType<FakeModel[]["find"]>;

interface FakeRuntimeContext {
  readonly mode: "tui";
  readonly model: FakeModel;
  readonly scopedModels: readonly never[];
  readonly modelRegistry: { readonly find: (provider: string, id: string) => FakeModelLookup };
  readonly sessionManager: { readonly getEntries: () => never[]; readonly getSessionFile: () => undefined };
}

interface FakeClearContext {
  readonly newSession: () => Promise<{ readonly cancelled: boolean }>;
}

type FakeHandler = (event: { readonly reason: string }, ctx: FakeRuntimeContext) => Promise<void> | void;

type FakeClearHandler = (args: string, ctx: FakeClearContext) => Promise<void>;

function createFakeRuntime(model: FakeModel, thinkingLevel: string, availableModels: readonly FakeModel[] = [model]) {
  const handlers = new Map<string, FakeHandler>();
  const clearHandlers: FakeClearHandler[] = [];
  let stale = false;
  let selectedModel = model;
  let selectedThinkingLevel = thinkingLevel;
  const pi = {
    on: (name: string, handler: FakeHandler) => handlers.set(name, handler),
    registerCommand: (_name: string, command: { handler: FakeClearHandler }) => {
      clearHandlers.push(command.handler);
    },
    getThinkingLevel: () => {
      if (stale) throw new Error("stale pi");
      return selectedThinkingLevel;
    },
    setModel: async (next: FakeModel) => {
      if (stale) throw new Error("stale pi");
      selectedModel = next;
      return true;
    },
    setThinkingLevel: (level: string) => {
      if (stale) throw new Error("stale pi");
      selectedThinkingLevel = level;
    },
  };
  clearExtension(asExtensionApi(pi));
  lastModelExtension(asExtensionApi(pi));
  const context = (): FakeRuntimeContext => ({
    mode: "tui",
    model: selectedModel,
    scopedModels: [],
    modelRegistry: {
      find: (provider: string, id: string) =>
        availableModels.find((candidate) => candidate.provider === provider && candidate.id === id),
    },
    sessionManager: { getEntries: () => [], getSessionFile: () => undefined },
  });
  function dispatch(name: string, event: { readonly reason: string }): Promise<void> | void {
    const handler = handlers.get(name);
    if (!handler) throw new Error(`No handler registered for ${name}`);
    return handler(event, context());
  }
  function runClear(clearContext: FakeClearContext): Promise<void> {
    const [clear] = clearHandlers;
    if (clear === undefined) throw new Error("No clear command registered");
    return clear("", clearContext);
  }
  return {
    get model() {
      return selectedModel;
    },
    get thinkingLevel() {
      return selectedThinkingLevel;
    },
    invalidate() {
      stale = true;
    },
    emit: dispatch,
    clear: runClear,
  };
}

test("/clear preserves the active model and thinking level without accessing stale pi", async () => {
  const chosen = { provider: "example", id: "chosen" };
  const previous = createFakeRuntime(chosen, "high");
  const replacement = createFakeRuntime({ provider: "example", id: "default" }, "low", [
    { provider: "example", id: "default" },
    chosen,
  ]);
  await previous.clear({
    newSession: async () => {
      await previous.emit("session_before_switch", { reason: "new" });
      previous.invalidate();
      await replacement.emit("session_start", { reason: "new" });
      return { cancelled: false };
    },
  });
  const savedModel: unknown = JSON.parse(readFileSync(join(stateHome, "pi", "last-model.json"), "utf8"));
  expect(savedModel).toEqual({
    provider: "example",
    id: "chosen",
    thinkingLevel: "high",
  });
  expect(replacement.model).toEqual(chosen);
  expect(replacement.thinkingLevel).toBe("high");

  const nextRuntime = createFakeRuntime({ provider: "example", id: "default" }, "low", [chosen]);
  await replacement.clear({
    newSession: async () => {
      await replacement.emit("session_before_switch", { reason: "new" });
      replacement.invalidate();
      await nextRuntime.emit("session_start", { reason: "new" });
      return { cancelled: false };
    },
  });
  expect(nextRuntime.model).toEqual(chosen);
  expect(nextRuntime.thinkingLevel).toBe("high");
});
