import { readFile } from "node:fs/promises";

export async function isReadableFile(path: string): Promise<boolean> {
  try {
    await readFile(path, "utf8");
    return true;
  } catch {
    return false;
  }
}
