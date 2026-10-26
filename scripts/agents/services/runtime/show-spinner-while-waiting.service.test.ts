import { describe, expect, test } from "bun:test";
import { SPINNER_LINE_RESET_SEQUENCE, SPINNER_TEXT } from "../../constants/runtime/spinner.constant.ts";
import { createRecordingStream } from "./recording-terminal-stream.test-double.ts";
import { showSpinnerWhileWaiting } from "./show-spinner-while-waiting.service.ts";

describe("showSpinnerWhileWaiting", () => {
  test("writes nothing when the output is not a terminal", async () => {
    const output = createRecordingStream({ isTTY: false, columns: 0 });
    expect(await showSpinnerWhileWaiting(Promise.resolve("done"), output)).toBe("done");
    expect(output.writes).toEqual([]);
  });

  test("draws the first frame and clears the line once the work finishes", async () => {
    const output = createRecordingStream({ isTTY: true, columns: 80 });
    expect(await showSpinnerWhileWaiting(Promise.resolve("done"), output)).toBe("done");
    expect(output.writes).toEqual([`${SPINNER_LINE_RESET_SEQUENCE}⠋ ${SPINNER_TEXT}`, SPINNER_LINE_RESET_SEQUENCE]);
  });

  test("clears the line even when the work fails", async () => {
    const output = createRecordingStream({ isTTY: true, columns: 80 });
    const failedWork = Promise.reject(new Error("example-failure"));
    await expect(showSpinnerWhileWaiting(failedWork, output)).rejects.toThrow("example-failure");
    expect(output.writes.at(-1)).toBe(SPINNER_LINE_RESET_SEQUENCE);
  });
});
