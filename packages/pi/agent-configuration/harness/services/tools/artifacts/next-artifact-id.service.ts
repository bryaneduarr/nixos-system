import { mkdir, readdir } from "node:fs/promises";

export async function nextArtifactId(dir: string): Promise<string> {
  await mkdir(dir, { recursive: true });
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
