import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonicalDirectory } from "./canonical-directory.service.ts";

const temporary = await mkdtemp(join(tmpdir(), "pi-canonical-test-"));
afterAll(() => rm(temporary, { recursive: true, force: true }));

describe("canonicalDirectory", () => {
  test("canonical project paths resolve links and reject files and missing directories", async () => {
    const link = join(temporary, "project-link");
    await symlink(temporary, link);
    expect(await canonicalDirectory(link, temporary)).toBe(temporary);
    const file = join(temporary, "file");
    await writeFile(file, "data");
    await expect(canonicalDirectory(file, temporary)).rejects.toThrow();
    await expect(canonicalDirectory("missing", temporary)).rejects.toThrow();
  });
});
