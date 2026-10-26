import { afterAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Value } from "typebox/value";
import { NameReservationSchema } from "../../../../schemas/sessions/registry/name/name-reservation.schema.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import type { SessionRegistry } from "../../../../types/sessions/registry/row/session-registry.interface.ts";
import { processStartIdentity } from "../identity/process-start-identity.service.ts";
import { createSessionRegistry } from "./create-session-registry.service.ts";

const temporary = await mkdtemp(join(tmpdir(), "pi-sessions-test-"));
afterAll(() => rm(temporary, { recursive: true, force: true }));
const processStart = await processStartIdentity(process.pid);

function temporarySession(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    identity: randomUUID(),
    pid: process.pid,
    processStart,
    updatedAt: Date.now(),
    cwd: temporary,
    pane: "w2:p3",
    tab: "w2:t2",
    workspace: "w2",
    sessionId: "session-a",
    name: "test",
    branch: "main",
    context: { usageState: "unavailable" },
    status: "idle",
    owned: false,
    historyEver: false,
    cleanupSafe: false,
    ...overrides,
  };
}

function registry(): SessionRegistry {
  return createSessionRegistry(join(temporary, randomUUID()));
}

describe("createSessionRegistry", () => {
  test("history-ever survives removing the live record", async () => {
    const store = registry();
    const row = temporarySession({ historyEver: true });
    await store.publish(row);
    await store.remove(row.identity, false);
    expect(await store.hasHistory(row.identity)).toBe(true);
    expect(await store.hasHistory(randomUUID())).toBe(false);
  });

  test("instance names are numbered, stable across reloads, and reserved before startup", async () => {
    const store = registry();
    const first = randomUUID();
    expect(await store.instanceName("/tmp/sample-project", first)).toBe("sample-project-pi-1");
    expect(await store.instanceName("/tmp/sample-project", first)).toBe("sample-project-pi-1");
    const names = await Promise.all(
      Array.from({ length: 5 }, () => store.instanceName("/tmp/sample-project", randomUUID())),
    );
    expect(new Set(names).size).toBe(5);
    expect(names.sort()).toEqual([2, 3, 4, 5, 6].map((number) => `sample-project-pi-${number}`));
    expect(await store.instanceName("/other/sample-project", randomUUID())).toBe("sample-project-pi-7");
    expect(await store.instanceName("/tmp/123 Unusual!", randomUUID())).toBe("project-123-unusual--pi-1");
    const long = await store.instanceName(`/tmp/${"a".repeat(100)}`, randomUUID());
    expect(long.length).toBeLessThanOrEqual(32);
    expect(long).toMatch(/^[a-z][a-z0-9_-]*-pi-1$/);
  });

  test("closed sessions release numbers and surviving sessions compact to one and two", async () => {
    const store = registry();
    const cwd = "/tmp/sample-project";
    const rows: LiveSession[] = [];
    for (let index = 0; index < 5; index++) {
      const row = temporarySession({ cwd });
      row.name = await store.instanceName(cwd, row.identity);
      await store.publish(row);
      rows.push(row);
    }
    for (const row of rows.slice(0, 3)) await store.remove(row.identity, false);
    const fourth = rows.at(3);
    const fifth = rows.at(4);
    if (fourth === undefined) throw new Error("Expected five published sessions");
    if (fifth === undefined) throw new Error("Expected five published sessions");
    expect(await store.instanceName(cwd, fourth.identity)).toBe("sample-project-pi-1");
    expect(await store.instanceName(cwd, fifth.identity)).toBe("sample-project-pi-2");
    expect(await store.instanceName(cwd, randomUUID())).toBe("sample-project-pi-3");
  });

  test("old permanent reservations and stale startup reservations do not consume numbers", async () => {
    const store = registry();
    const token = randomUUID();
    await store.instanceName("/tmp/sample-project", token);
    const path = join(store.directory, `${token}.reservation`);
    const reservation: unknown = JSON.parse(await readFile(path, "utf8"));
    if (!Value.Check(NameReservationSchema, reservation)) throw new Error("Reservation fixture is invalid");
    await writeFile(path, JSON.stringify({ ...reservation, updatedAt: Date.now() - 120_000 }));
    await mkdir(join(store.directory, "sample-project-pi-1.instance"));
    await writeFile(join(store.directory, `${randomUUID()}.name`), "sample-project-pi-1");
    expect(await store.instanceName("/tmp/sample-project", randomUUID())).toBe("sample-project-pi-1");
  });

  test("existing live records with historical numbers migrate to a dense sequence", async () => {
    const store = registry();
    const first = temporarySession({ cwd: "/tmp/sample-project", name: "sample-project-pi-4" });
    const second = temporarySession({ cwd: first.cwd, name: "sample-project-pi-5" });
    await store.publish(first);
    await store.publish(second);
    expect(await store.instanceName(first.cwd, first.identity)).toBe("sample-project-pi-1");
    expect(await store.instanceName(second.cwd, second.identity)).toBe("sample-project-pi-2");
  });

  test("stale and PID-reused sessions release their name reservations", async () => {
    for (const override of [{ updatedAt: Date.now() - 30_000 }, { processStart: "previous-process" }]) {
      const store = registry();
      const row = temporarySession({ cwd: "/tmp/sample-project", ...override });
      row.name = await store.instanceName(row.cwd, row.identity);
      await store.publish(row);
      expect(await store.instanceName(row.cwd, randomUUID())).toBe("sample-project-pi-1");
    }
  });

  test("registry publishes private atomic records, preserves project paths and removes stale rows", async () => {
    const store = registry();
    const live = temporarySession();
    const stale = temporarySession({ updatedAt: Date.now() - 30_000 });
    await store.publish(live);
    await store.publish(stale);
    expect((await stat(store.directory)).mode & 0o777).toBe(0o700);
    expect((await stat(join(store.directory, `${live.identity}.json`))).mode & 0o777).toBe(0o600);
    expect(await store.list()).toEqual([expect.objectContaining(live)]);
    await expect(readFile(join(store.directory, `${stale.identity}.json`))).rejects.toThrow();
    await store.remove(live.identity, false);
    expect(await store.projects()).toEqual([temporary]);
  });

  test("registry rejects reused PID process identities", async () => {
    const store = registry();
    await store.publish(temporarySession({ processStart: "old-boot:old-start" }));
    expect(await store.list()).toEqual([]);
  });
});
