import { describe, expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { readGitBranch } from "./read-git-branch.service.ts";

describe("readGitBranch", () => {
  test("non-Git projects do not show a conversation-tree branch", async () => {
    expect(await readGitBranch(tmpdir())).toBe("no git");
  });
});
