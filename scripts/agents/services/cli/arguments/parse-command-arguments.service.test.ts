import { describe, expect, test } from "bun:test";
import { PROVIDER_ORDER } from "../../../constants/usage/provider-order.constant.ts";
import { parseCommandArguments } from "./parse-command-arguments.service.ts";

describe("parseCommandArguments", () => {
  test("prints help without arguments, with --help, or with -h", () => {
    expect(parseCommandArguments([])).toEqual({ command: "help" });
    expect(parseCommandArguments(["--help"])).toEqual({ command: "help" });
    expect(parseCommandArguments(["-h"])).toEqual({ command: "help" });
  });

  test("prints cards for every provider with --usage alone", () => {
    expect(parseCommandArguments(["--usage"])).toEqual({
      command: "usage",
      output: "cards",
      watch: false,
      providers: PROVIDER_ORDER,
    });
  });

  test("prints JSON with --usage --json", () => {
    expect(parseCommandArguments(["--usage", "--json"])).toEqual({
      command: "usage",
      output: "json",
      watch: false,
      providers: PROVIDER_ORDER,
    });
  });

  test("watches cards with --usage --watch", () => {
    expect(parseCommandArguments(["--usage", "--watch"])).toEqual({
      command: "usage",
      output: "cards",
      watch: true,
      providers: PROVIDER_ORDER,
    });
  });

  test("rejects --json combined with --watch", () => {
    expect(parseCommandArguments(["--usage", "--json", "--watch"])).toEqual({
      command: "invalid",
      message: "--json cannot be combined with --watch.",
    });
  });

  test("rejects --json without --usage", () => {
    expect(parseCommandArguments(["--json"])).toEqual({
      command: "invalid",
      message: "--json can only be used with --usage.",
    });
  });

  test("names every usage-only flag given without --usage", () => {
    expect(parseCommandArguments(["--watch", "--provider", "claude"])).toEqual({
      command: "invalid",
      message: "--watch, --provider can only be used with --usage.",
    });
  });

  test("keeps providers in display order and collapses duplicates", () => {
    expect(parseCommandArguments(["--usage", "--provider", "opencode,claude,opencode"])).toEqual({
      command: "usage",
      output: "cards",
      watch: false,
      providers: ["claude", "opencode"],
    });
  });

  test("accepts the --provider=value form", () => {
    expect(parseCommandArguments(["--usage", "--provider=opencode,claude"])).toEqual({
      command: "usage",
      output: "cards",
      watch: false,
      providers: ["claude", "opencode"],
    });
  });

  test("rejects an unknown provider and lists the valid names", () => {
    expect(parseCommandArguments(["--usage", "--provider", "gemini"])).toEqual({
      command: "invalid",
      message: 'Unknown provider "gemini". Valid providers: claude, opencode.',
    });
  });

  test("rejects an empty provider value in both forms", () => {
    const emptyValueMessage = "--provider requires at least one provider name.";
    expect(parseCommandArguments(["--usage", "--provider="])).toEqual({
      command: "invalid",
      message: emptyValueMessage,
    });
    expect(parseCommandArguments(["--usage", "--provider", ""])).toEqual({
      command: "invalid",
      message: emptyValueMessage,
    });
  });

  test("rejects --provider without a value", () => {
    const missingValueMessage = "--provider requires a value, such as --provider claude,opencode.";
    expect(parseCommandArguments(["--usage", "--provider"])).toEqual({
      command: "invalid",
      message: missingValueMessage,
    });
    expect(parseCommandArguments(["--usage", "--provider", "--json"])).toEqual({
      command: "invalid",
      message: missingValueMessage,
    });
  });

  test("rejects an unknown flag by name", () => {
    expect(parseCommandArguments(["--usage", "--verbose"])).toEqual({
      command: "invalid",
      message: 'Unknown argument "--verbose". Run agents --help to list options.',
    });
  });

  test("rejects a repeated --provider", () => {
    expect(parseCommandArguments(["--usage", "--provider", "claude", "--provider=opencode"])).toEqual({
      command: "invalid",
      message: "--provider can be given only once; separate names with commas.",
    });
  });
});
