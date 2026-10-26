import { describe, expect, test } from "bun:test";
import { SPINNER_TEXT } from "../../constants/runtime/spinner.constant.ts";
import { buildUsageJson } from "../usage/json/build-usage-json.service.ts";
import { failedUsage, okUsage, PIPED, runAgentsWith, TERMINAL } from "./run-agents.test-double.ts";

const ESCAPE_CHARACTER = "\u001b";

describe("runAgents usage output", () => {
  test("prints usage cards without colors or a spinner when output is piped", async () => {
    const outcome = await runAgentsWith(["--usage"], { ...PIPED, usages: [okUsage] });
    expect(outcome.exitCode).toBe(0);
    expect(outcome.stdout).toContain("Claude Code");
    expect(outcome.stdout).not.toContain(ESCAPE_CHARACTER);
    expect(outcome.stderr).toBe("");
  });

  test("prints JSON and exits 1 when every provider failed", async () => {
    const outcome = await runAgentsWith(["--usage", "--json"], { ...PIPED, usages: [failedUsage] });
    expect(outcome.exitCode).toBe(1);
    expect(outcome.stdout).toBe(`${buildUsageJson([failedUsage])}\n`);
    expect(outcome.stderr).toBe("");
  });

  test("shows the spinner on stderr only when stderr is a terminal", async () => {
    const outcome = await runAgentsWith(["--usage"], { ...TERMINAL, usages: [okUsage] });
    expect(outcome.stderr).toContain(SPINNER_TEXT);
    expect(outcome.stdout).toContain("Claude Code");
  });

  test("never shows the spinner for JSON output", async () => {
    const outcome = await runAgentsWith(["--usage", "--json"], { ...TERMINAL, usages: [okUsage] });
    expect(outcome.stderr).toBe("");
  });

  test("colors cards on a terminal", async () => {
    const outcome = await runAgentsWith(["--usage"], { ...TERMINAL, usages: [okUsage] });
    expect(outcome.stdout).toContain(ESCAPE_CHARACTER);
  });

  test("turns colors off on a terminal when NO_COLOR is set", async () => {
    const outcome = await runAgentsWith(["--usage"], {
      ...TERMINAL,
      usages: [okUsage],
      environment: { NO_COLOR: "1" },
    });
    expect(outcome.stdout).not.toContain(ESCAPE_CHARACTER);
  });
});
