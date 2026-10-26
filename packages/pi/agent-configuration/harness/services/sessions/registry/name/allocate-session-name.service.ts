import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  PRIVATE_FILE_MODE,
  RESERVATION_SUFFIX,
} from "../../../../constants/sessions/registry/registry-files.constant.ts";
import type { NameReservation } from "../../../../types/sessions/registry/name/name-reservation.interface.ts";
import { processStartIdentity } from "../identity/process-start-identity.service.ts";
import { listLiveSessions } from "../row/list-live-sessions.service.ts";
import { deriveProjectName } from "./derive-project-name.service.ts";
import { readNameReservations } from "./read-name-reservations.service.ts";

export async function allocateSessionName(directory: string, cwd: string, identity: string): Promise<string> {
  const now = Date.now();
  const live = await listLiveSessions(directory, now);
  const reservations = await readNameReservations(directory, now, new Set(live.map((row) => row.identity)));
  let order = Math.max(now, ...reservations.map((row) => row.order));
  for (const row of live) {
    if (reservations.some((reservation) => reservation.identity === row.identity)) continue;
    const reservation: NameReservation = {
      identity: row.identity,
      project: deriveProjectName(row.cwd),
      order: ++order,
      updatedAt: now,
      pid: row.pid,
      processStart: row.processStart,
    };
    reservations.push(reservation);
    await writeFile(join(directory, `${row.identity}${RESERVATION_SUFFIX}`), JSON.stringify(reservation), {
      mode: PRIVATE_FILE_MODE,
    });
  }
  const others = reservations.filter((row) => row.identity !== identity);
  const existing = reservations.find((row) => row.identity === identity);
  const processStart = await processStartIdentity(process.pid);
  const current: NameReservation = existing
    ? { ...existing, updatedAt: now, pid: process.pid, processStart }
    : { identity, project: deriveProjectName(cwd), order: ++order, updatedAt: now, pid: process.pid, processStart };
  await writeFile(join(directory, `${identity}${RESERVATION_SUFFIX}`), JSON.stringify(current), {
    mode: PRIVATE_FILE_MODE,
  });
  const group = [...others, current].filter((row) => row.project === current.project).sort((a, b) => a.order - b.order);
  const position = group.findIndex((row) => row.identity === identity) + 1;
  return `${current.project}-pi-${position}`;
}
