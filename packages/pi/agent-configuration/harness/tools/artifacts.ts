import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { WORK_DIR } from "./config.ts";

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function nextId(dir: string): Promise<string> {
  await ensureDir(dir);
  let max = 0;
  try {
    for (const name of await readdir(dir)) {
      const match = /^(\d+)(?:[.-]|$)/.exec(name);
      if (match) {
        max = Math.max(max, Number(match[1]));
      }
    }
  } catch {
    max = 0;
  }
  return String(max + 1).padStart(4, "0");
}

export async function writeArtifact(
  cwd: string,
  kind: string,
  extension: string,
  content: string,
): Promise<string> {
  const dir = join(cwd, WORK_DIR, kind);
  const id = await nextId(dir);
  const path = join(dir, `${id}.${extension}`);
  await writeFile(path, content, "utf8");
  return relative(cwd, path);
}
