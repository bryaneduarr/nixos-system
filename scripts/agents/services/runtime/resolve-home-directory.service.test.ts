import { describe, expect, test } from "bun:test";
import { resolveHomeDirectory } from "./resolve-home-directory.service.ts";

const FALLBACK_HOME_DIRECTORY = "/example/fallback-home";

describe("resolveHomeDirectory", () => {
  test("uses the HOME variable when it is set", () => {
    expect(resolveHomeDirectory("/example/home", FALLBACK_HOME_DIRECTORY)).toBe("/example/home");
  });

  test("falls back to the operating system home directory when HOME is unset", () => {
    expect(resolveHomeDirectory(undefined, FALLBACK_HOME_DIRECTORY)).toBe(FALLBACK_HOME_DIRECTORY);
  });

  test("falls back to the operating system home directory when HOME is empty", () => {
    expect(resolveHomeDirectory("", FALLBACK_HOME_DIRECTORY)).toBe(FALLBACK_HOME_DIRECTORY);
  });
});
