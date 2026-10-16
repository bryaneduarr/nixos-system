import { afterAll, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canCleanup } from "../agent-configuration/harness/sessions/cleanup.ts";
import { cleanupAfterExit, dedicatedShell } from "../agent-configuration/harness/sessions/cleanup-worker.mjs";
import { HerdrSessions, paneIdentity, scopedHerdr, type HerdrCommand } from "../agent-configuration/harness/sessions/herdr.ts";
import { canReportSession, canonicalDirectory, parseSession, SessionRegistry, sessionStatus, type LiveSession } from "../agent-configuration/harness/sessions/registry.ts";

const temporary = await mkdtemp(join(tmpdir(), "pi-sessions-test-"));
afterAll(() => rm(temporary, { recursive: true, force: true }));

function session(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    identity: randomUUID(), pid: process.pid, updatedAt: Date.now(), cwd: temporary,
    pane: "w2:p3", tab: "w2:t2", workspace: "w2", sessionId: "session-a", name: "test",
    branch: "main", percent: null, status: "idle", owned: false, historyEver: false,
    cleanupSafe: false, ...overrides,
  };
}

function registry(): SessionRegistry {
  return new SessionRegistry(join(temporary, randomUUID()));
}

test("print, RPC and JSON subagents never report as interactive sessions", () => {
  expect(canReportSession("tui", "1")).toBe(true);
  for (const mode of ["print", "rpc", "json"]) expect(canReportSession(mode, "1")).toBe(false);
  expect(canReportSession("tui", undefined)).toBe(false);
});

test("history-ever survives removing the live record", async () => {
  const store = registry();
  const row = session({ historyEver: true });
  await store.publish(row);
  await store.remove(row.identity);
  expect(await store.hasHistory(row.identity)).toBe(true);
  expect(await store.hasHistory(randomUUID())).toBe(false);
});

test("instance names are numbered, stable across reloads, and reserved before startup", async () => {
  const store = registry();
  const first = randomUUID();
  expect(await store.instanceName("/tmp/sample-project", first)).toBe("sample-project-pi-1");
  expect(await store.instanceName("/tmp/sample-project", first)).toBe("sample-project-pi-1");
  const names = await Promise.all(Array.from({ length: 5 }, () => store.instanceName("/tmp/sample-project", randomUUID())));
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
    const row = session({ cwd });
    row.name = await store.instanceName(cwd, row.identity);
    await store.publish(row);
    rows.push(row);
  }
  for (const row of rows.slice(0, 3)) await store.remove(row.identity);
  expect(await store.instanceName(cwd, rows[3]!.identity)).toBe("sample-project-pi-1");
  expect(await store.instanceName(cwd, rows[4]!.identity)).toBe("sample-project-pi-2");
  expect(await store.instanceName(cwd, randomUUID())).toBe("sample-project-pi-3");
});

test("old permanent reservations and stale startup reservations do not consume numbers", async () => {
  const store = registry();
  const token = randomUUID();
  await store.instanceName("/tmp/sample-project", token);
  const path = join(store.directory, `${token}.reservation`);
  const reservation = JSON.parse(await readFile(path, "utf8"));
  await writeFile(path, JSON.stringify({ ...reservation, updatedAt: Date.now() - 120_000 }));
  await mkdir(join(store.directory, "sample-project-pi-1.instance"));
  await writeFile(join(store.directory, `${randomUUID()}.name`), "sample-project-pi-1");
  expect(await store.instanceName("/tmp/sample-project", randomUUID())).toBe("sample-project-pi-1");
});

test("existing live records with historical numbers migrate to a dense sequence", async () => {
  const store = registry();
  const first = session({ cwd: "/tmp/sample-project", name: "sample-project-pi-4" });
  const second = session({ cwd: first.cwd, name: "sample-project-pi-5" });
  await store.publish(first);
  await store.publish(second);
  expect(await store.instanceName(first.cwd, first.identity)).toBe("sample-project-pi-1");
  expect(await store.instanceName(second.cwd, second.identity)).toBe("sample-project-pi-2");
});

test("stale and PID-reused sessions release their name reservations", async () => {
  for (const override of [{ updatedAt: Date.now() - 30_000 }, { processStart: "previous-process" }]) {
    const store = registry();
    const row = session({ cwd: "/tmp/sample-project", ...override });
    row.name = await store.instanceName(row.cwd, row.identity);
    await store.publish(row);
    expect(await store.instanceName(row.cwd, randomUUID())).toBe("sample-project-pi-1");
  }
});

test("pending agent renames can be retried without suppressing other failures", async () => {
  const location = { pane: "w1:p1", tab: "w1:t1", workspace: "w1" };
  let pending = true;
  const herdr = new HerdrSessions(registry(), async (args) => {
    if (args[0] === "agent" && pending) {
      throw Object.assign(new Error("startup pending"), { code: "agent_launch_pending" });
    }
    return {};
  });
  expect(await herdr.name(location, "sample-pi-1")).toBe(false);
  pending = false;
  expect(await herdr.name(location, "sample-pi-1")).toBe(true);
  const broken = new HerdrSessions(registry(), async () => { throw new Error("disconnected"); });
  await expect(broken.name(location, "sample-pi-1")).rejects.toThrow("disconnected");
});

test("nonzero CLI exits preserve structured Herdr error codes", async () => {
  const previous = process.env.HERDR_BIN_PATH;
  const binary = join(temporary, "fake-herdr");
  await writeFile(binary, `#!${process.execPath}\nprocess.stderr.write(JSON.stringify({ error: { code: "agent_launch_pending", message: "startup pending" } })); process.exit(1);\n`, { mode: 0o700 });
  try {
    process.env.HERDR_BIN_PATH = binary;
    await expect(scopedHerdr("/tmp/sample.sock")(["agent", "rename", "w1:p1", "sample-pi-1"])).rejects.toMatchObject({ code: "agent_launch_pending" });
  } finally {
    if (previous === undefined) delete process.env.HERDR_BIN_PATH;
    else process.env.HERDR_BIN_PATH = previous;
  }
});

test("working takes priority over an editor draft", () => {
  expect(sessionStatus(true, "draft")).toBe("working");
  expect(sessionStatus(false, " ")).toBe("draft");
  expect(sessionStatus(false, "")).toBe("idle");
});

test("canonical project paths resolve links and reject files and missing directories", async () => {
  const link = join(temporary, "project-link");
  await symlink(temporary, link);
  expect(await canonicalDirectory(link, temporary)).toBe(temporary);
  const file = join(temporary, "file");
  await writeFile(file, "data");
  await expect(canonicalDirectory(file, temporary)).rejects.toThrow();
  await expect(canonicalDirectory("missing", temporary)).rejects.toThrow();
});

test("registry publishes private atomic records, preserves project paths and removes stale rows", async () => {
  const store = registry();
  const live = session();
  const stale = session({ updatedAt: Date.now() - 30_000 });
  await store.publish(live);
  await store.publish(stale);
  expect((await stat(store.directory)).mode & 0o777).toBe(0o700);
  expect((await stat(join(store.directory, `${live.identity}.json`))).mode & 0o777).toBe(0o600);
  expect(await store.list()).toEqual([expect.objectContaining(live)]);
  await expect(readFile(join(store.directory, `${stale.identity}.json`))).rejects.toThrow();
  await store.remove(live.identity);
  expect(await store.projects()).toEqual([temporary]);
});

test("invalid registry records cannot become focus targets", () => {
  expect(parseSession({ ...session(), pane: "--current" })).toBeUndefined();
  expect(parseSession({ ...session(), pid: -1 })).toBeUndefined();
  expect(parseSession({ ...session(), percent: "20" })).toBeUndefined();
  expect(parseSession({ ...session(), cleanupSafe: undefined })).toBeUndefined();
  expect(() => paneIdentity({ pane_id: "--current" })).toThrow();
});

test("lifecycle reports use the harness source and increasing sequences", async () => {
  const commands: string[][] = [];
  const herdr = new HerdrSessions(registry(), async (args) => {
    commands.push(args);
    return {};
  });
  const row = session({ status: "working" });
  const path = join(temporary, "session.jsonl");

  await herdr.report(row, path);
  await herdr.report({ ...row, status: "idle" }, path);
  await herdr.report({ ...row, status: "draft" });
  await herdr.release(row);

  const stateReports = commands.filter((args) => args[1] === "report-agent");
  expect(stateReports.map((args) => args[args.indexOf("--state") + 1])).toEqual(["working", "idle", "idle"]);
  expect(commands[0]).toContain("--agent-session-path");
  expect(commands[0]).toContain(path);
  expect(commands[4]).toContain("--agent-session-id");
  expect(commands[4]).toContain(row.sessionId);
  expect(commands.at(-1)?.[1]).toBe("release-agent");

  const sequences = commands.map((args) => Number(args[args.indexOf("--seq") + 1]));
  for (const [index, args] of commands.entries()) {
    expect(args[args.indexOf("--source") + 1]).toBe("pi:harness");
    expect(args).not.toContain("herdr:pi");
    expect(args[2]).toBe(row.pane);
    if (index > 0) expect(sequences[index]!).toBeGreaterThan(sequences[index - 1]!);
  }
});

test("switching only focuses a registered destination and never closes or signals a process", async () => {
  const store = registry();
  const row = session({ status: "working", historyEver: true });
  await store.publish(row);
  const commands: string[][] = [];
  const herdr = new HerdrSessions(store, async (args) => {
    commands.push(args);
    return { pane: { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: "pi" }, process_info: { foreground_processes: [{ pid: row.pid }] } };
  });
  await herdr.focus(row);
  expect(commands).toEqual([["pane", "get", row.pane], ["pane", "process-info", "--pane", row.pane], ["agent", "focus", row.pane]]);
  await store.publish({ ...row, sessionId: "replacement" });
  await expect(herdr.focus(row)).rejects.toThrow("no longer live");
  expect(commands.length).toBe(3);
});

test("creation splits the caller pane and waits for startup and registry readiness before focus", async () => {
  const store = registry();
  const commands: string[][] = [];
  const cwd = "/tmp/project with spaces; echo unsafe";
  const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
  let token = "";
  const command: HerdrCommand = async (args) => {
    commands.push(args);
    if (args[1] === "layout") return { layout: { panes: [{ pane_id: source.pane, rect: { width: 160, height: 40 } }] } };
    if (args[1] === "split") {
      const env = args.find((item) => item.startsWith("PI_MANAGED_SESSION="))!;
      token = env.slice("PI_MANAGED_SESSION=".length);
      return { pane: { pane_id: "w2:p3", tab_id: source.tab, workspace_id: source.workspace } };
    }
    if (args[1] === "start") {
      const name = await store.instanceName(cwd, token);
      expect(args[2]).toBe(name);
      expect(await store.list()).toEqual([]);
      await store.publish(session({ identity: token, cwd, name, owned: true }));
    }
    return { pane: { pane_id: "w2:p3", tab_id: source.tab, workspace_id: source.workspace, agent: "pi" }, process_info: { foreground_processes: [{ pid: process.pid }] } };
  };
  await new HerdrSessions(store, command).create(cwd, source);
  expect(commands.map((args) => args.slice(0, 2))).toEqual([["pane", "layout"], ["pane", "split"], ["pane", "rename"], ["agent", "start"], ["pane", "get"], ["pane", "process-info"], ["agent", "focus"]]);
  expect(commands[1]).toContain(cwd);
  expect(commands[1]).toContain("--no-focus");
  expect(commands[1]).toContain(source.pane);
  expect(commands[1]).toContain("right");
  expect(commands[3]).toContain("--timeout");
});

test("narrow panes split down even when another workspace hosts the project", async () => {
  const store = registry();
  await store.publish(session({ owned: true }));
  const source = { pane: "w1:p1", tab: "w1:t1", workspace: "w1" };
  const commands: string[][] = [];
  const command: HerdrCommand = async (args) => {
    commands.push(args);
    if (args[1] === "layout") return { layout: { panes: [{ pane_id: source.pane, rect: { width: 60, height: 40 } }] } };
    if (args[1] === "split") {
      const token = args.find((item) => item.startsWith("PI_MANAGED_SESSION="))!.split("=")[1]!;
      await store.publish(session({ identity: token, pane: "w1:p2", tab: source.tab, workspace: source.workspace, owned: true }));
    }
    return { pane: { pane_id: "w1:p2", tab_id: source.tab, workspace_id: source.workspace, agent: "pi" }, process_info: { foreground_processes: [{ pid: process.pid }] } };
  };
  await new HerdrSessions(store, command).create(temporary, source);
  expect(commands[1]?.slice(0, 6)).toEqual(["pane", "split", "--pane", source.pane, "--direction", "down"]);
  expect(commands.some((args) => args[0] === "tab" || args[0] === "workspace")).toBe(false);
});

test("startup failure never focuses or closes existing panes", async () => {
  const store = registry();
  const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
  const commands: string[][] = [];
  const herdr = new HerdrSessions(store, async (args) => {
    commands.push(args);
    if (args[1] === "layout") return { layout: { panes: [{ pane_id: source.pane, rect: { width: 160, height: 40 } }] } };
    if (args[1] === "start") throw new Error("Not ready");
    return { pane: { pane_id: "w2:p3", tab_id: source.tab, workspace_id: source.workspace } };
  });
  await expect(herdr.create(temporary, source)).rejects.toThrow("Not ready");
  expect(commands.map((args) => args.slice(0, 2))).toEqual([["pane", "layout"], ["pane", "split"], ["pane", "rename"], ["agent", "start"]]);
  expect(await store.instanceName(temporary, randomUUID())).toMatch(/-pi-1$/);
});

test("creation rejects a destination outside the calling tab before starting Pi", async () => {
  const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
  const destinations = [
    { pane_id: "w2:p3", tab_id: "w2:t3", workspace_id: "w2" },
    { pane_id: "w3:p1", tab_id: "w3:t1", workspace_id: "w3" },
    { pane_id: source.pane, tab_id: source.tab, workspace_id: source.workspace },
  ];
  for (const destination of destinations) {
    const commands: string[][] = [];
    const herdr = new HerdrSessions(registry(), async (args) => {
      commands.push(args);
      if (args[1] === "layout") return { layout: { panes: [{ pane_id: source.pane, rect: { width: 160, height: 40 } }] } };
      return { pane: destination };
    });
    await expect(herdr.create(temporary, source)).rejects.toThrow("sibling pane");
    expect(commands.map((args) => args.slice(0, 2))).toEqual([["pane", "layout"], ["pane", "split"]]);
  }
});

test("registry rejects reused PID process identities", async () => {
  const store = registry();
  await store.publish(session({ processStart: "old-boot:old-start" }));
  expect(await store.list()).toEqual([]);
});

test("cleanup requires owned untouched empty idle sessions and all activity guards", () => {
  const row = session({ owned: true });
  const ctx: any = { signal: undefined, isIdle: () => true, hasPendingMessages: () => false, ui: { getEditorText: () => "" } };
  expect(canCleanup(row, ctx, false, false)).toBe(true);
  for (const override of [{ owned: false }, { historyEver: true }]) expect(canCleanup({ ...row, ...override }, ctx, false, false)).toBe(false);
  expect(canCleanup(row, ctx, true, false)).toBe(false);
  expect(canCleanup(row, ctx, false, true)).toBe(false);
  expect(canCleanup(row, { ...ctx, signal: new AbortController().signal }, false, false)).toBe(false);
  expect(canCleanup(row, { ...ctx, isIdle: () => false }, false, false)).toBe(false);
  expect(canCleanup(row, { ...ctx, hasPendingMessages: () => true }, false, false)).toBe(false);
  expect(canCleanup(row, { ...ctx, ui: { getEditorText: () => "/tmp/attached-image.png" } }, false, false)).toBe(false);
});

test("detached cleanup closes only the exact shell pane after the original process exits", async () => {
  const row = { ...session({ owned: true, cleanupSafe: true, processStart: "boot:123" }), socket: "/tmp/test-herdr.sock" };
  const tab = { tab_id: row.tab, workspace_id: row.workspace, pane_count: 2 };
  const pane = { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: null, agent_status: "idle" };
  const process_info = { pane_id: row.pane, shell_pid: 4321, foreground_processes: [{ pid: 4321, name: "bash" }] };
  expect(dedicatedShell(tab, pane, row, process_info)).toBe(true);
  expect(dedicatedShell({ ...tab, pane_count: 2 }, pane, row, process_info)).toBe(true);
  expect(dedicatedShell(tab, { ...pane, agent: "replacement" }, row, process_info)).toBe(false);
  expect(dedicatedShell(tab, pane, row, { ...process_info, foreground_processes: [{ pid: 4322, name: "bash" }] })).toBe(false);
  const commands: string[][] = [];
  const command = async (args: string[]) => { commands.push(args); return { tab, pane, process_info }; };
  const exited = async () => { throw Object.assign(new Error("gone"), { code: "ENOENT" }); };
  expect(await cleanupAfterExit(row, command, exited, async () => {})).toBe(true);
  expect(commands.at(-1)).toEqual(["pane", "close", row.pane]);
  expect(commands.some((args) => args[0] === "tab" && args[1] === "close")).toBe(false);
  commands.length = 0;
  expect(await cleanupAfterExit(row, command, async () => "boot:replacement", async () => {})).toBe(false);
  expect(commands).toEqual([]);
  expect(await cleanupAfterExit({ ...row, historyEver: true }, command, exited, async () => {})).toBe(false);
  let inspections = 0;
  const replaced = async (args: string[]) => {
    commands.push(args);
    if (args[0] === "pane" && args[1] === "get") inspections++;
    return { tab, pane: inspections > 1 ? { ...pane, agent: "pi" } : pane, process_info };
  };
  commands.length = 0;
  expect(await cleanupAfterExit(row, replaced, exited, async () => {})).toBe(false);
  expect(commands.some((args) => args[1] === "close")).toBe(false);
});

test("focus refuses a replacement process in an otherwise valid Pi pane", async () => {
  const store = registry();
  const row = session();
  await store.publish(row);
  const commands: string[][] = [];
  const herdr = new HerdrSessions(store, async (args) => {
    commands.push(args);
    return {
      pane: { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: "pi" },
      process_info: { foreground_processes: [{ pid: row.pid + 1 }] },
    };
  });
  await expect(herdr.focus(row)).rejects.toThrow("no longer hosts");
  expect(commands.some((args) => args[0] === "agent" && args[1] === "focus")).toBe(false);
});
