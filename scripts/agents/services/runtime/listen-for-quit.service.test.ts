import { describe, expect, test } from "bun:test";
import { setTimeout as delay } from "node:timers/promises";
import { INTERRUPT_KEY, QUIT_KEY, QUIT_SIGNALS } from "../../constants/runtime/quit-key.constant.ts";
import type { QuitListener } from "../../types/runtime/quit-listener.interface.ts";
import { listenForQuit } from "./listen-for-quit.service.ts";
import { createFakeKeyInput, createFakeSignalSource } from "./quit-listener.test-double.ts";

async function isQuitRequested(listener: QuitListener): Promise<boolean> {
  const requested = listener.quitRequested.then(() => true);
  return Promise.race([requested, delay(0).then(() => false)]);
}

describe("listenForQuit", () => {
  test("switches a terminal into raw mode and restores it on dispose", () => {
    const keys = createFakeKeyInput(true);
    listenForQuit({ keys, signals: createFakeSignalSource() }).dispose();
    expect(keys.rawModeCalls).toEqual([true, false]);
  });

  test("leaves raw mode alone when standard input is not a terminal", () => {
    const keys = createFakeKeyInput(false);
    listenForQuit({ keys, signals: createFakeSignalSource() }).dispose();
    expect(keys.rawModeCalls).toEqual([]);
  });

  test("requests a quit when q is pressed", async () => {
    const keys = createFakeKeyInput(true);
    const listener = listenForQuit({ keys, signals: createFakeSignalSource() });
    keys.pressKey(QUIT_KEY);
    expect(await isQuitRequested(listener)).toBe(true);
  });

  test("requests a quit when Ctrl-C is pressed", async () => {
    const keys = createFakeKeyInput(true);
    const listener = listenForQuit({ keys, signals: createFakeSignalSource() });
    keys.pressKey(INTERRUPT_KEY);
    expect(await isQuitRequested(listener)).toBe(true);
  });

  test("ignores other keys", async () => {
    const keys = createFakeKeyInput(true);
    const listener = listenForQuit({ keys, signals: createFakeSignalSource() });
    keys.pressKey("x");
    expect(await isQuitRequested(listener)).toBe(false);
  });

  test.each(QUIT_SIGNALS)("requests a quit when %s arrives", async (signal) => {
    const signals = createFakeSignalSource();
    const listener = listenForQuit({ keys: createFakeKeyInput(false), signals });
    signals.sendSignal(signal);
    expect(await isQuitRequested(listener)).toBe(true);
  });

  test("removes its key and signal listeners on dispose", () => {
    const keys = createFakeKeyInput(true);
    const signals = createFakeSignalSource();
    listenForQuit({ keys, signals }).dispose();
    expect(keys.attachedListenerCount()).toBe(0);
    expect(signals.attachedListenerCount()).toBe(0);
  });
});
