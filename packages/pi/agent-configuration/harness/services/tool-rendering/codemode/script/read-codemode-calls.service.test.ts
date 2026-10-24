import { expect, test } from "bun:test";
import { readCodemodeCalls } from "./read-codemode-calls.service.ts";

test("call details that do not match the schema read as no calls", () => {
  expect(readCodemodeCalls({ calls: "none" })).toEqual([]);
  expect(readCodemodeCalls(undefined)).toEqual([]);
  expect(readCodemodeCalls({ calls: [{ name: "a", args: "{}", status: "ok" }] })).toEqual([
    { name: "a", status: "ok", durationMs: { state: "absent" } },
  ]);
});
