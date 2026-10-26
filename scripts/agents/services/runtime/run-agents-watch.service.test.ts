import { describe, expect, test } from "bun:test";
import { QUIT_KEY } from "../../constants/runtime/quit-key.constant.ts";
import { HIDE_CURSOR_SEQUENCE, SHOW_CURSOR_SEQUENCE } from "../../constants/runtime/terminal-sequence.constant.ts";
import { renderUsageCards } from "../usage/render/render-usage-cards.service.ts";
import { createFakeKeyInput, createFakeSignalSource, type FakeKeyInput } from "./quit-listener.test-double.ts";
import { createRecordingStream, type RecordingTerminalStream } from "./recording-terminal-stream.test-double.ts";
import { runAgents } from "./run-agents.service.ts";
import { NOW, okUsage } from "./run-agents.test-double.ts";

const TERMINAL_COLUMNS = 100;
const NARROW_COLUMNS = 60;

interface WaitContext {
  readonly waitCount: number;
  readonly stdout: RecordingTerminalStream;
  readonly keys: FakeKeyInput;
}

interface WatchRun {
  readonly exitCode: number;
  readonly stdout: RecordingTerminalStream;
  readonly keys: FakeKeyInput;
}

function renderCards(width: number): string {
  return renderUsageCards({ usages: [okUsage], now: NOW, colorEnabled: false, width });
}

function neverElapses(): Promise<void> {
  return new Promise<void>(() => {});
}

async function runWatchWith(onWait: (context: WaitContext) => Promise<void>): Promise<WatchRun> {
  const stdout = createRecordingStream({ isTTY: true, columns: TERMINAL_COLUMNS });
  const stderr = createRecordingStream({ isTTY: true, columns: TERMINAL_COLUMNS });
  const keys = createFakeKeyInput(true);
  let waitCount = 0;
  const exitCode = await runAgents({
    argv: ["--usage", "--watch"],
    environment: { NO_COLOR: "1" },
    stdin: keys,
    stdout,
    stderr,
    signals: createFakeSignalSource(),
    wait: async () => {
      waitCount += 1;
      return onWait({ waitCount, stdout, keys });
    },
    readUsageSnapshot: async () => ({ usages: [okUsage], now: NOW }),
  });
  return { exitCode, stdout, keys };
}

describe("runAgents watch", () => {
  test("draws the cards until q is pressed, then restores the cursor and the terminal", async () => {
    const run = await runWatchWith(({ keys }) => {
      keys.pressKey(QUIT_KEY);
      return neverElapses();
    });

    expect(run.exitCode).toBe(0);
    expect(run.stdout.writes[0]).toBe(HIDE_CURSOR_SEQUENCE);
    expect(run.stdout.writes.at(-1)).toBe(SHOW_CURSOR_SEQUENCE);
    expect(run.stdout.writes.join("")).toContain("Claude Code");
    expect(run.keys.rawModeCalls).toEqual([true, false]);
  });

  test("renders each refresh at the terminal width in effect when that refresh runs", async () => {
    const run = await runWatchWith(({ waitCount, stdout, keys }) => {
      if (waitCount === 1) {
        stdout.resize(NARROW_COLUMNS);
        return Promise.resolve();
      }
      keys.pressKey(QUIT_KEY);
      return neverElapses();
    });

    const [, firstRefresh, secondRefresh] = run.stdout.writes;
    expect(firstRefresh).toContain(renderCards(TERMINAL_COLUMNS));
    expect(secondRefresh).toContain(renderCards(NARROW_COLUMNS));
  });
});
