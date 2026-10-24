import { expect, test } from "bun:test";
import { plural } from "./plural.service.ts";

test("a count of one is singular and every other count is plural", () => {
  expect(plural(1, "line")).toBe("1 line");
  expect(plural(0, "line")).toBe("0 lines");
  expect(plural(2, "char")).toBe("2 chars");
});
