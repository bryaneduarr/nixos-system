import { describe, expect, test } from "bun:test";
import { stripStringsAndComments } from "./strip-strings-and-comments.service.ts";

describe("stripStringsAndComments", () => {
  test("blanks string contents but keeps quotes and code", () => {
    expect(stripStringsAndComments('const label = "a?.b";')).toBe('const label = "    ";');
  });

  test("blanks line and block comments", () => {
    expect(stripStringsAndComments("value; // x?.y\n/* a | undefined */ next")).toBe(
      `value;${" ".repeat(8)}\n${" ".repeat(20)}next`,
    );
  });

  test("keeps template expressions as code", () => {
    expect(stripStringsAndComments(`\`id \${entry?.id} done\``)).toBe(`\`   \${entry?.id}     \``);
  });

  test("blanks regex literals but keeps division", () => {
    expect(stripStringsAndComments("const pattern = /a|undefined[/]/g;")).toBe(`const pattern = /${" ".repeat(14)}/g;`);
    expect(stripStringsAndComments("const half = total / 2 / 1;")).toBe("const half = total / 2 / 1;");
  });

  test("keeps line numbers by preserving newlines in multi-line comments", () => {
    expect(stripStringsAndComments("/* one\ntwo */\ncode").split("\n")).toHaveLength(3);
  });
});
