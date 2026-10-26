import { INTERRUPT_KEY, QUIT_KEY, QUIT_SIGNALS } from "../../constants/runtime/quit-key.constant.ts";
import type { QuitListener, QuitListenerInput } from "../../types/runtime/quit-listener.interface.ts";

function isQuitKey(key: string): boolean {
  return key === QUIT_KEY || key === INTERRUPT_KEY;
}

export function listenForQuit(input: QuitListenerInput): QuitListener {
  const quitRequest = Promise.withResolvers<void>();
  const requestQuit = () => quitRequest.resolve();
  const handleKeyData = (chunk: string) => {
    if (isQuitKey(chunk)) requestQuit();
  };
  if (input.keys.isTTY) input.keys.setRawMode(true);
  input.keys.setEncoding("utf8");
  input.keys.on("data", handleKeyData);
  input.keys.resume();
  for (const signal of QUIT_SIGNALS) input.signals.on(signal, requestQuit);
  return {
    quitRequested: quitRequest.promise,
    dispose() {
      if (input.keys.isTTY) input.keys.setRawMode(false);
      input.keys.off("data", handleKeyData);
      input.keys.pause();
      for (const signal of QUIT_SIGNALS) input.signals.off(signal, requestQuit);
    },
  };
}
