import { readFile } from "node:fs/promises";

const BOOT_ID_PATH = "/proc/sys/kernel/random/boot_id";
const STAT_FIELD_INDEX = 19;

export async function processStartIdentity(pid: number): Promise<string> {
  const statContents = await readFile(`/proc/${pid}/stat`, "utf8");
  const start = statContents.slice(statContents.lastIndexOf(")") + 2).split(" ")[STAT_FIELD_INDEX];
  const boot = (await readFile(BOOT_ID_PATH, "utf8")).trim();
  if (!start || !boot) throw new Error("Cannot identify process");
  return `${boot}:${start}`;
}
