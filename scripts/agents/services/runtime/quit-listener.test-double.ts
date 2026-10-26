import type { KeyInput, QuitSignal, SignalSource } from "../../types/runtime/quit-listener.interface.ts";

/** Key input that tests drive by pressing keys and that records raw mode changes. */
export interface FakeKeyInput extends KeyInput {
  /** Raw mode values set on the input, in call order. */
  readonly rawModeCalls: readonly boolean[];
  /** Number of key listeners still attached. */
  attachedListenerCount(): number;
  /** Delivers a chunk of key input to every attached listener. */
  pressKey(chunk: string): void;
}

/** Signal source that tests trigger by sending signals and that counts attached listeners. */
export interface FakeSignalSource extends SignalSource {
  /** Number of signal listeners still attached. */
  attachedListenerCount(): number;
  /** Delivers a signal to every listener attached for it. */
  sendSignal(signal: QuitSignal): void;
}

export function createFakeKeyInput(isTTY: boolean): FakeKeyInput {
  const listeners = new Set<(chunk: string) => void>();
  const rawModeCalls: boolean[] = [];
  return {
    isTTY,
    rawModeCalls,
    setRawMode(enabled: boolean) {
      rawModeCalls.push(enabled);
    },
    setEncoding() {},
    on(_event: "data", listener: (chunk: string) => void) {
      listeners.add(listener);
    },
    off(_event: "data", listener: (chunk: string) => void) {
      listeners.delete(listener);
    },
    resume() {},
    pause() {},
    attachedListenerCount: () => listeners.size,
    pressKey(chunk: string) {
      for (const listener of listeners) listener(chunk);
    },
  };
}

export function createFakeSignalSource(): FakeSignalSource {
  const attachments = new Set<{ readonly signal: QuitSignal; readonly listener: () => void }>();
  return {
    on(signal: QuitSignal, listener: () => void) {
      attachments.add({ signal, listener });
    },
    off(signal: QuitSignal, listener: () => void) {
      for (const attachment of attachments) {
        if (attachment.signal === signal && attachment.listener === listener) attachments.delete(attachment);
      }
    },
    attachedListenerCount: () => attachments.size,
    sendSignal(signal: QuitSignal) {
      for (const attachment of attachments) {
        if (attachment.signal === signal) attachment.listener();
      }
    },
  };
}
