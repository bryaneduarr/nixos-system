import {
  CARRIAGE_RETURN,
  CONTROL_SEQUENCE_INTRODUCER,
  CURSOR_UP_FINAL_BYTE,
  ERASE_BELOW_SEQUENCE,
} from "../../constants/runtime/terminal-sequence.constant.ts";
import { WATCH_FAILED_FOOTER_TEXT, WATCH_FOOTER_TEXT } from "../../constants/runtime/watch.constant.ts";
import type { WatchUsageInput } from "../../types/runtime/watch-usage.interface.ts";
import { createRecordingStream, type RecordingTerminalStream } from "./recording-terminal-stream.test-double.ts";

type ScriptedLoad = { readonly outcome: "cards"; readonly text: string } | { readonly outcome: "throws" };

type WatchFixtureResize = { readonly state: "none" } | { readonly state: "after-first-wait"; readonly columns: number };

interface WatchFixture {
  readonly input: WatchUsageInput;
  readonly stdout: RecordingTerminalStream;
  readonly stderr: RecordingTerminalStream;
}

interface WatchFixtureOptions {
  readonly loads: readonly ScriptedLoad[];
  readonly quitAfterWaits: number;
  readonly stderrIsTTY: boolean;
  readonly columns: number;
  readonly resize: WatchFixtureResize;
}

export const DEFAULT_COLUMNS = 80;
export const NARROW_COLUMNS = 10;
export const FIRST_CARDS = "first card\nfirst row";
export const SECOND_CARDS = "second card\nsecond row";
export const WRAPPING_CARDS = "a card line that wraps";
export const FIRST_FRAME = `${FIRST_CARDS}\n\n${WATCH_FOOTER_TEXT}\n`;
export const SECOND_FRAME = `${SECOND_CARDS}\n\n${WATCH_FOOTER_TEXT}\n`;
export const FAILED_FRAME = `${FIRST_CARDS}\n\n${WATCH_FAILED_FOOTER_TEXT}\n`;
export const FAILED_ONLY_FRAME = `${WATCH_FAILED_FOOTER_TEXT}\n`;
export const WRAPPING_FRAME = `${WRAPPING_CARDS}\n\n${WATCH_FOOTER_TEXT}\n`;
export const FIRST_FRAME_ROWS = 4;
export const FAILED_ONLY_FRAME_ROWS = 1;
export const FIRST_FRAME_ROWS_AT_NARROW_COLUMNS = 6;
export const WRAPPING_FRAME_ROWS_AT_NARROW_COLUMNS = 7;

export function drawFrame(frame: string): string {
  return `${CARRIAGE_RETURN}${ERASE_BELOW_SEQUENCE}${frame}`;
}

export function redrawOver(previousRowCount: number, frame: string): string {
  const moveUpSequence = `${CONTROL_SEQUENCE_INTRODUCER}${previousRowCount}${CURSOR_UP_FINAL_BYTE}`;
  return `${CARRIAGE_RETURN}${moveUpSequence}${ERASE_BELOW_SEQUENCE}${frame}`;
}

function takeScriptedLoad(pendingLoads: ScriptedLoad[]): ScriptedLoad {
  const load = pendingLoads.shift();
  if (load === undefined) throw new Error("No scripted refresh left.");
  return load;
}

export function createWatchFixture(options: WatchFixtureOptions): WatchFixture {
  const pendingLoads = [...options.loads];
  const quit = Promise.withResolvers<void>();
  let waitCount = 0;
  const stdout = createRecordingStream({ isTTY: true, columns: options.columns });
  const stderr = createRecordingStream({ isTTY: options.stderrIsTTY, columns: DEFAULT_COLUMNS });
  return {
    input: {
      loadCards: async () => {
        const load = takeScriptedLoad(pendingLoads);
        if (load.outcome === "throws") throw new Error("example-refresh-failure");
        return load.text;
      },
      stdout,
      stderr,
      wait: async () => {
        waitCount += 1;
        if (waitCount === 1 && options.resize.state === "after-first-wait") stdout.resize(options.resize.columns);
        if (waitCount === options.quitAfterWaits) quit.resolve();
      },
      quitRequested: quit.promise,
      footerLine: WATCH_FOOTER_TEXT,
      failedFooterLine: WATCH_FAILED_FOOTER_TEXT,
    },
    stdout,
    stderr,
  };
}
