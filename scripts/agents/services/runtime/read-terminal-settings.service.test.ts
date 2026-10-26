import { describe, expect, test } from "bun:test";
import { readTerminalSettings } from "./read-terminal-settings.service.ts";
import { createRecordingStream } from "./recording-terminal-stream.test-double.ts";

function terminalWithColumns(columns: number) {
  return createRecordingStream({ isTTY: true, columns });
}

describe("readTerminalSettings", () => {
  test("enables colors and uses the terminal width on a terminal", () => {
    expect(readTerminalSettings({ environment: {}, stdout: terminalWithColumns(90) })).toEqual({
      colorEnabled: true,
      width: 90,
    });
  });

  test("disables colors when NO_COLOR is set to any non-empty value", () => {
    const settings = readTerminalSettings({
      environment: { NO_COLOR: "1" },
      stdout: terminalWithColumns(90),
    });
    expect(settings.colorEnabled).toBe(false);
  });

  test("keeps colors when NO_COLOR is set but empty", () => {
    const settings = readTerminalSettings({
      environment: { NO_COLOR: "" },
      stdout: terminalWithColumns(90),
    });
    expect(settings.colorEnabled).toBe(true);
  });

  test("disables colors and uses 80 columns when output is not a terminal", () => {
    const piped = createRecordingStream({ isTTY: false, columns: 0 });
    expect(readTerminalSettings({ environment: {}, stdout: piped })).toEqual({ colorEnabled: false, width: 80 });
  });

  test("clamps the terminal width to between 40 and 100 columns", () => {
    expect(readTerminalSettings({ environment: {}, stdout: terminalWithColumns(20) }).width).toBe(40);
    expect(readTerminalSettings({ environment: {}, stdout: terminalWithColumns(300) }).width).toBe(100);
  });
});
