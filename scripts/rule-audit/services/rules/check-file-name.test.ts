import { describe, expect, test } from "bun:test";
import { checkBannedName } from "./check-banned-name.service.ts";
import { checkRoleSuffix } from "./check-role-suffix.service.ts";

describe("checkBannedName", () => {
  test("reports banned words in file and folder names", () => {
    expect(checkBannedName("services/activity/shared-store.service.ts")).toHaveLength(1);
    expect(checkBannedName("utils/format.service.ts")).toHaveLength(1);
  });

  test("allows names that only contain the letters", () => {
    expect(checkBannedName("services/activity/sharedness.service.ts")).toEqual([]);
  });
});

describe("checkRoleSuffix", () => {
  test("reports files without a role suffix", () => {
    expect(checkRoleSuffix("patches/patch-pi.ts")).toEqual([
      { file: "patches/patch-pi.ts", line: 0, rule: "missing-role-suffix" },
    ]);
  });

  test("allows role suffixes and a tool entry file at the project root", () => {
    expect(checkRoleSuffix("patches/pi.patch.ts")).toEqual([]);
    expect(checkRoleSuffix("services/read-rows.service.test.ts")).toEqual([]);
    expect(checkRoleSuffix("rule-audit.ts")).toEqual([]);
  });
});
