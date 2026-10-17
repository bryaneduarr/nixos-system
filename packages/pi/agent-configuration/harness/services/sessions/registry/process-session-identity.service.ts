import { createHash } from "node:crypto";
import { processStartIdentity } from "./process-start-identity.service.ts";

export async function processSessionIdentity(scope: string, pid: number): Promise<string> {
  const start = await processStartIdentity(pid);
  const hash = createHash("sha256").update(`${scope}:${pid}:${start}`).digest("hex");
  return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join("-");
}
