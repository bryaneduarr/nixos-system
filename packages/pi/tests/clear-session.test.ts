import { afterAll, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import clearExtension from "../agent-configuration/extensions/clear-session";

const stateHome = mkdtempSync(join(tmpdir(), "pi-clear-test-"));
process.env.XDG_STATE_HOME = stateHome;
afterAll(() => rmSync(stateHome, { recursive: true, force: true }));

// Import after setting XDG_STATE_HOME; the extension resolves the state path at load time.
const { default: lastModelExtension } = await import("../agent-configuration/extensions/last-model");

type Model = { provider: string; id: string };
type Handler = (event: any, ctx: any) => Promise<void> | void;

function runtime(model: Model, thinkingLevel: string, availableModels: Model[] = [model]) {
  const handlers = new Map<string, Handler>();
  let clear: ((args: string, ctx: any) => Promise<void>) | undefined;
  let stale = false;
  let selectedModel = model;
  let selectedThinkingLevel = thinkingLevel;
  const pi = {
    on: (name: string, handler: Handler) => handlers.set(name, handler),
    registerCommand: (_name: string, command: { handler: typeof clear }) => {
      clear = command.handler;
    },
    getThinkingLevel: () => {
      if (stale) throw new Error("stale pi");
      return selectedThinkingLevel;
    },
    setModel: async (next: Model) => {
      if (stale) throw new Error("stale pi");
      selectedModel = next;
      return true;
    },
    setThinkingLevel: (level: string) => {
      if (stale) throw new Error("stale pi");
      selectedThinkingLevel = level;
    },
  };
  clearExtension(pi as unknown as ExtensionAPI);
  lastModelExtension(pi as unknown as ExtensionAPI);
  const ctx = () => ({
    mode: "tui",
    model: selectedModel,
    scopedModels: [],
    modelRegistry: {
      find: (provider: string, id: string) =>
        availableModels.find((candidate) => candidate.provider === provider && candidate.id === id),
    },
    sessionManager: { getEntries: () => [], getSessionFile: () => undefined },
  });
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
    emit: (name: string, event: any) => handlers.get(name)?.(event, ctx()),
    clear: (context: any) => clear!("", context),
  };
}

test("/clear preserves the active model and thinking level without accessing stale pi", async () => {
  const chosen = { provider: "example", id: "chosen" };
  const previous = runtime(chosen, "high");
  let replacement: ReturnType<typeof runtime> | undefined;
  await previous.clear({
    newSession: async () => {
      await previous.emit("session_before_switch", { reason: "new" });
      previous.invalidate();
      replacement = runtime({ provider: "example", id: "default" }, "low", [
        { provider: "example", id: "default" },
        chosen,
      ]);
      await replacement.emit("session_start", { reason: "new" });
      return { cancelled: false };
    },
  });
  expect(JSON.parse(readFileSync(join(stateHome, "pi", "last-model.json"), "utf8"))).toEqual({
    provider: "example",
    id: "chosen",
    thinkingLevel: "high",
  });
  expect(replacement?.model).toEqual(chosen);
  expect(replacement?.thinkingLevel).toBe("high");

  // A second /clear must carry the same selection forward again.
  let next: ReturnType<typeof runtime> | undefined;
  await replacement!.clear({
    newSession: async () => {
      await replacement!.emit("session_before_switch", { reason: "new" });
      replacement!.invalidate();
      next = runtime({ provider: "example", id: "default" }, "low", [chosen]);
      await next.emit("session_start", { reason: "new" });
      return { cancelled: false };
    },
  });
  expect(next?.model).toEqual(chosen);
  expect(next?.thinkingLevel).toBe("high");
});
