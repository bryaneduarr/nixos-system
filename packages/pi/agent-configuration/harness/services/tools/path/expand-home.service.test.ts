import { expect, test } from "bun:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { expandHome } from "./expand-home.service.ts";

test("expands the home alias and prefix", () => {
  expect(expandHome("~")).toBe(homedir());
  expect(expandHome("~/work")).toBe(join(homedir(), "work"));
});

test("keeps other paths unchanged", () => {
  expect(expandHome("/tmp/work")).toBe("/tmp/work");
  expect(expandHome("work/~")).toBe("work/~");
});
