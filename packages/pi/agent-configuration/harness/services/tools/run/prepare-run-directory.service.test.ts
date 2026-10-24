import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareRunDirectory } from "./prepare-run-directory.service.ts";

const createdDirectories: string[] = [];

async function sessionDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "pi-run-directory-"));
  createdDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  for (const directory of createdDirectories.splice(0)) {
    await rm(directory, { recursive: true, force: true });
  }
});

test("uses the session directory when no other directory is requested", async () => {
  const directory = await sessionDirectory();

  expect(await prepareRunDirectory(directory, ".")).toEqual({ state: "ready", directory });
});

test("creates a nested directory that does not exist yet", async () => {
  const directory = await sessionDirectory();
  const target = join(directory, "work", "check");

  expect(await prepareRunDirectory(directory, "work/check")).toEqual({ state: "ready", directory: target });
  expect((await stat(target)).isDirectory()).toBe(true);
});

test("blocks a path that already exists as a file", async () => {
  const directory = await sessionDirectory();
  const target = join(directory, "notes.txt");
  await writeFile(target, "text");

  expect(await prepareRunDirectory(directory, "notes.txt")).toEqual({
    state: "blocked",
    directory: target,
    reason: "not-a-directory",
  });
});

test("blocks a directory whose parent is a file", async () => {
  const directory = await sessionDirectory();
  const target = join(directory, "notes.txt", "work");
  await writeFile(join(directory, "notes.txt"), "text");

  expect(await prepareRunDirectory(directory, "notes.txt/work")).toEqual({
    state: "blocked",
    directory: target,
    reason: "cannot-create",
  });
});
