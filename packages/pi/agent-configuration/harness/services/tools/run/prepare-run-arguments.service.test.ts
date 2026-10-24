import { expect, test } from "bun:test";
import { prepareRunArguments } from "./prepare-run-arguments.service.ts";

test("moves a leading cd into cwd", () => {
  expect(prepareRunArguments({ command: "cd /tmp/example && ls -la", timeoutMs: 5000 })).toEqual({
    command: "ls -la",
    cwd: "/tmp/example",
    timeoutMs: 5000,
  });
});

test("keeps the command unchanged when cwd is already given", () => {
  expect(prepareRunArguments({ command: "cd src && ls", cwd: "apps/web" })).toEqual({
    command: "cd src && ls",
    cwd: "apps/web",
  });
});

test("accepts the run key that some models send instead of command", () => {
  expect(prepareRunArguments({ run: "git status" })).toEqual({ command: "git status" });
});

test("rejects arguments without a command", () => {
  expect(() => prepareRunArguments({ cwd: "/tmp" })).toThrow("run requires 'command'.");
  expect(() => prepareRunArguments("git status")).toThrow("run expects");
});
