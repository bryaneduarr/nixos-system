import { readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { Value } from "typebox/value";
import { RESERVATION_STALE_MS } from "../../../../constants/sessions/registry/registry.constant.ts";
import {
  RESERVATION_FILE_PATTERN,
  RESERVATION_SUFFIX,
} from "../../../../constants/sessions/registry/registry-files.constant.ts";
import { NameReservationSchema } from "../../../../schemas/sessions/registry/name/name-reservation.schema.ts";
import type { NameReservation } from "../../../../types/sessions/registry/name/name-reservation.interface.ts";
import { processStartIdentity } from "../identity/process-start-identity.service.ts";

export async function readNameReservations(
  directory: string,
  now: number,
  liveIdentities: ReadonlySet<string>,
): Promise<NameReservation[]> {
  const reservations: NameReservation[] = [];
  for (const file of await readdir(directory)) {
    if (!RESERVATION_FILE_PATTERN.test(file)) continue;
    const path = join(directory, file);
    try {
      const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
      if (!Value.Check(NameReservationSchema, parsed) || `${parsed.identity}${RESERVATION_SUFFIX}` !== file) {
        await rm(path, { force: true });
        continue;
      }
      const isLive = liveIdentities.has(parsed.identity);
      const isExpired = now - parsed.updatedAt > RESERVATION_STALE_MS;
      const isReusedProcess = parsed.processStart !== (await processStartIdentity(parsed.pid).catch(() => ""));
      if (!isLive && (isExpired || isReusedProcess)) {
        await rm(path, { force: true });
        continue;
      }
      reservations.push(parsed);
    } catch {}
  }
  return reservations;
}
