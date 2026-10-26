import type { TerminalStream } from "../../types/runtime/terminal-settings.interface.ts";

/** Terminal stream that keeps every write so tests can check exact output and can be resized between writes. */
export interface RecordingTerminalStream extends TerminalStream {
  /** Text written to the stream, in write order. */
  readonly writes: readonly string[];
  /** Changes the reported width, as a terminal resize does. */
  resize(columns: number): void;
}

export function createRecordingStream(input: {
  readonly isTTY: boolean;
  readonly columns: number;
}): RecordingTerminalStream {
  const writes: string[] = [];
  let columns = input.columns;
  return {
    isTTY: input.isTTY,
    get columns() {
      return columns;
    },
    writes,
    write(text: string): void {
      writes.push(text);
    },
    resize(nextColumns: number): void {
      columns = nextColumns;
    },
  };
}
