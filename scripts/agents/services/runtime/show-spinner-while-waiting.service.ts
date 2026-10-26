import {
  SPINNER_FRAMES,
  SPINNER_INTERVAL_MILLISECONDS,
  SPINNER_LINE_RESET_SEQUENCE,
  SPINNER_TEXT,
} from "../../constants/runtime/spinner.constant.ts";
import type { TerminalStream } from "../../types/runtime/terminal-settings.interface.ts";

function spinnerFrameAt(frameIndex: number): string {
  const frame = SPINNER_FRAMES[frameIndex % SPINNER_FRAMES.length];
  if (frame === undefined) throw new Error("Spinner frames must not be empty.");
  return frame;
}

export async function showSpinnerWhileWaiting<T>(work: Promise<T>, output: TerminalStream): Promise<T> {
  if (!output.isTTY) return work;
  let frameIndex = 0;
  const drawFrame = (): void => {
    output.write(`${SPINNER_LINE_RESET_SEQUENCE}${spinnerFrameAt(frameIndex)} ${SPINNER_TEXT}`);
    frameIndex += 1;
  };
  drawFrame();
  const frameTimer = setInterval(drawFrame, SPINNER_INTERVAL_MILLISECONDS);
  try {
    return await work;
  } finally {
    clearInterval(frameTimer);
    output.write(SPINNER_LINE_RESET_SEQUENCE);
  }
}
