import { describe, expect, test } from "bun:test";
import { JSON_WITH_WATCH_MESSAGE, WATCH_REQUIRES_TERMINAL_MESSAGE } from "../../constants/cli/command-text.constant.ts";
import { buildHelpText } from "../cli/help/build-help-text.service.ts";
import { okUsage, PIPED, runAgentsWith, TERMINAL } from "./run-agents.test-double.ts";

describe("runAgents", () => {
  test("prints help and exits 0 when no arguments are given", async () => {
    const outcome = await runAgentsWith([], { ...PIPED, usages: [okUsage] });
    expect(outcome).toEqual({ exitCode: 0, stdout: `${buildHelpText()}\n`, stderr: "", requestedProviders: [] });
  });

  test("prints help and exits 0 for --help and -h", async () => {
    for (const flag of ["--help", "-h"]) {
      const outcome = await runAgentsWith([flag], { ...PIPED, usages: [okUsage] });
      expect(outcome.exitCode).toBe(0);
      expect(outcome.stdout).toBe(`${buildHelpText()}\n`);
    }
  });

  test("reports an unknown argument on stderr with the help hint and exits 2", async () => {
    const outcome = await runAgentsWith(["--nope"], { ...PIPED, usages: [okUsage] });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stdout).toBe("");
    expect(outcome.stderr).toContain('Unknown argument "--nope".');
    expect(outcome.stderr.endsWith("Run agents --help.\n")).toBe(true);
  });

  test("rejects --json without --usage", async () => {
    const outcome = await runAgentsWith(["--json"], { ...PIPED, usages: [okUsage] });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stderr).toContain("--json can only be used with --usage.");
  });

  test("rejects --json combined with --watch before reading usage", async () => {
    const outcome = await runAgentsWith(["--usage", "--json", "--watch"], { ...TERMINAL, usages: [okUsage] });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stderr).toContain(JSON_WITH_WATCH_MESSAGE);
    expect(outcome.requestedProviders).toEqual([]);
  });

  test("rejects --watch when standard output is not a terminal", async () => {
    const outcome = await runAgentsWith(["--usage", "--watch"], { ...PIPED, usages: [okUsage] });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stderr).toContain(WATCH_REQUIRES_TERMINAL_MESSAGE);
    expect(outcome.requestedProviders).toEqual([]);
  });

  test("rejects --watch when standard input is not a terminal", async () => {
    const outcome = await runAgentsWith(["--usage", "--watch"], { ...TERMINAL, stdinIsTTY: false, usages: [okUsage] });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stderr).toContain(WATCH_REQUIRES_TERMINAL_MESSAGE);
    expect(outcome.requestedProviders).toEqual([]);
  });

  test("rejects an unknown provider before reading usage", async () => {
    const outcome = await runAgentsWith(["--usage", "--provider", "nope"], { ...PIPED, usages: [okUsage] });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.requestedProviders).toEqual([]);
  });

  test("reads only the providers named by --provider", async () => {
    const outcome = await runAgentsWith(["--usage", "--provider", "opencode"], { ...PIPED, usages: [okUsage] });
    expect(outcome.exitCode).toBe(0);
    expect(outcome.requestedProviders).toEqual([["opencode"]]);
  });
});
