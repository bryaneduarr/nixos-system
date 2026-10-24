import { mkdir, stat } from "node:fs/promises";
import type { RunDirectory } from "../../../types/tools/run/run-directory.interface.ts";
import { expandHome } from "../path/expand-home.service.ts";
import { resolveToolPath } from "../path/resolve-tool-path.service.ts";

type ExistingEntry = "directory" | "other" | "missing";

async function existingEntry(directory: string): Promise<ExistingEntry> {
  try {
    const entry = await stat(directory);
    return entry.isDirectory() ? "directory" : "other";
  } catch {
    return "missing";
  }
}

async function createDirectory(directory: string): Promise<RunDirectory> {
  try {
    await mkdir(directory, { recursive: true });
    return { state: "ready", directory };
  } catch {
    return { state: "blocked", directory, reason: "cannot-create" };
  }
}

export async function prepareRunDirectory(sessionDirectory: string, requestedDirectory: string): Promise<RunDirectory> {
  const directory = resolveToolPath(sessionDirectory, expandHome(requestedDirectory));
  const entry = await existingEntry(directory);
  if (entry === "directory") return { state: "ready", directory };
  if (entry === "other") return { state: "blocked", directory, reason: "not-a-directory" };
  return createDirectory(directory);
}
