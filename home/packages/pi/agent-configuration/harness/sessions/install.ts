import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { basename, join, resolve } from "node:path";
import { realpath } from "node:fs/promises";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getKeybindings } from "@earendil-works/pi-tui";
import { HerdrSessions, scopedHerdr } from "./herdr.ts";
import { canCleanup, scheduleCleanup } from "./cleanup.ts";
import type { selectProject, selectSession } from "./menu.ts";
import { canReportSession, canonicalDirectory, processStartIdentity, processSessionIdentity, registryDirectory, SessionRegistry, sessionStatus, type LiveSession } from "./registry.ts";

const execute = promisify(execFile);
const usedProcesses = new Set<string>();

export async function gitBranch(cwd: string): Promise<string> {
  try {
    const { stdout } = await execute("git", ["-C", cwd, "symbolic-ref", "--quiet", "--short", "HEAD"], { timeout: 2000 });
    return stdout.trim() || "no git";
  } catch {
    try {
      const { stdout } = await execute("git", ["-C", cwd, "rev-parse", "--short", "HEAD"], { timeout: 2000 });
      return `detached ${stdout.trim()}`;
    } catch { return "no git"; }
  }
}

export interface SessionDependencies {
  herdr?: (registry: SessionRegistry, socket: string) => HerdrSessions;
  selectSession?: typeof selectSession;
  selectProject?: typeof selectProject;
  scheduleCleanup?: typeof scheduleCleanup;
}

export function installSessions(pi: ExtensionAPI, dependencies: SessionDependencies = {}): void {
  let context: ExtensionContext | undefined;
  let registry: SessionRegistry | undefined;
  let herdr: HerdrSessions | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let identity = "";
  let cwd = "";
  let name = "";
  let pane: Awaited<ReturnType<HerdrSessions["current"]>> | undefined;
  let historyEver = false;
  let compacting = false;
  let publishing: Promise<void> | undefined;
  let open = false;
  let socket = "";
  let userBash = false;
  let latest: LiveSession | undefined;
  let branch = "no git";
  let branchUpdatedAt = 0;
  let reported = "";
  let named = "";
  let removeInputListener: (() => void) | undefined;

  const latch = () => {
    historyEver = true;
    if (latest) latest.historyEver = true;
    usedProcesses.add(identity);
  };

  const publish = (): Promise<void> => {
    if (publishing) return publishing;
    if (!context || !registry || !pane) return Promise.resolve();
    const ctx = context;
    const entries = ctx.sessionManager.getEntries();
    const hasConversation = entries.some((entry) => {
      if (entry.type === "compaction" || entry.type === "branch_summary") return true;
      if (entry.type !== "message") return false;
      return ["user", "assistant", "toolResult", "bashExecution"].includes(entry.message.role);
    });
    if (hasConversation) latch();
    publishing = (async () => {
      if (Date.now() - branchUpdatedAt >= 5000) {
        branch = await gitBranch(cwd);
        branchUpdatedAt = Date.now();
      }
      name = await registry!.instanceName(cwd, identity);
      const usage = ctx.getContextUsage();
      const editor = ctx.ui.getEditorText();
      const working = !ctx.isIdle() || ctx.hasPendingMessages() || compacting || !!ctx.signal;
      const row: LiveSession = {
        identity,
        pid: process.pid,
        updatedAt: Date.now(),
        cwd,
        ...pane!,
        sessionId: ctx.sessionManager.getSessionId(),
        name,
        branch,
        processStart: await processStartIdentity(process.pid),
        percent: usage?.percent ?? null,
        contextTokens: usage?.tokens ?? null,
        contextWindow: usage?.contextWindow,
        status: sessionStatus(working, editor),
        owned: identity === process.env.PI_MANAGED_SESSION,
        historyEver,
        cleanupSafe: false,
      };
      row.historyEver ||= historyEver;
      row.cleanupSafe = canCleanup(row, ctx, compacting, userBash);
      latest = row;
      const path = ctx.sessionManager.getSessionFile();
      const reportKey = `${row.sessionId}:${row.status}:${path || ""}`;
      if (reported !== reportKey) {
        await herdr!.report(row, path);
        reported = reportKey;
      }
      await registry!.publish(row);
      if (named !== name && await herdr!.name(pane!, name)) named = name;
    })().finally(() => { publishing = undefined; });
    return publishing;
  };

  const stop = async (preserveName = false): Promise<void> => {
    if (timer) clearInterval(timer);
    removeInputListener?.();
    removeInputListener = undefined;
    timer = undefined;
    context = undefined;
    if (publishing) await publishing.catch(() => {});
    if (latest && herdr) await herdr.release(latest).catch(() => {});
    if (registry && identity) await registry.remove(identity, preserveName);
    pane = undefined;
    latest = undefined;
    reported = "";
    named = "";
    branchUpdatedAt = 0;
  };

  pi.on("session_start", async (_event, ctx) => {
    await stop(true);
    if (!canReportSession(ctx.mode, process.env.HERDR_ENV)) return;
    try {
      socket = process.env.HERDR_SOCKET_PATH || process.env.HERDR_API_SOCKET || "";
      if (!socket) throw new Error("Herdr did not provide a session socket");
      socket = await realpath(resolve(socket)).catch(() => resolve(socket));
      const scopedDirectory = registryDirectory(socket);
      const override = process.env.PI_SESSION_REGISTRY;
      registry = new SessionRegistry(override ? (basename(override) === basename(scopedDirectory) ? override : join(override, basename(scopedDirectory))) : scopedDirectory);
      herdr = dependencies.herdr?.(registry, socket) ?? new HerdrSessions(registry, scopedHerdr(socket));
      pane = await herdr.current();
      identity = /^[a-f0-9-]{36}$/.test(process.env.PI_MANAGED_SESSION || "") ? process.env.PI_MANAGED_SESSION! : await processSessionIdentity(socket, process.pid);
      cwd = await canonicalDirectory(ctx.cwd, ctx.cwd);
      historyEver ||= usedProcesses.has(identity) || await registry.hasHistory(identity);
      context = ctx;
      compacting = false;
      removeInputListener = ctx.ui.onTerminalInput((data) => {
        if (getKeybindings().matches(data, "app.clipboard.pasteImage")) {
          latch();
          void registry!.markUsed(identity).catch(() => {});
        }
        return undefined;
      });
      await publish();
      timer = setInterval(() => void publish().catch(() => {}), 1000);
    } catch (error) {
      await stop();
      ctx.ui.notify(`Session manager unavailable: ${String(error)}`, "warning");
    }
  });

  pi.on("before_agent_start", async (_event, ctx) => {
    latch();
    if (context) { context = ctx; await publish(); }
  });
  pi.on("message_start", async (event, ctx) => {
    if (event.message.role !== "user") return;
    latch();
    if (context) { context = ctx; await publish(); }
  });
  pi.on("user_bash", () => {
    userBash = true;
    latch();
  });

  pi.on("session_before_compact", (_event, ctx) => {
    if (!context) return;
    compacting = true;
    context = ctx;
  });
  pi.on("session_compact", (_event, ctx) => {
    if (!context) return;
    compacting = false;
    context = ctx;
  });
  pi.on("session_compact_failed", (_event, ctx) => {
    if (!context) return;
    compacting = false;
    context = ctx;
  });
  pi.on("agent_start", async (_event, ctx) => {
    if (!context || ctx.mode !== "tui") return;
    context = ctx;
    await publish();
  });
  pi.on("agent_settled", async (_event, ctx) => {
    if (!context || ctx.mode !== "tui") return;
    context = ctx;
    await publish();
  });
  pi.on("session_shutdown", (event) => stop(["reload", "new", "resume", "fork"].includes(event.reason)));

  const switchSession = async (ctx: ExtensionContext, select: () => Promise<boolean>): Promise<void> => {
    if (open) return;
    if (ctx.mode !== "tui" || !registry || !herdr || !pane) {
      ctx.ui.notify("Sessions require an interactive Pi session inside Herdr", "warning");
      return;
    }
    open = true;
    try {
      context = ctx;
      await publish();
      if (await select()) {
        await publish();
        if (latest && !historyEver && canCleanup(latest, ctx, compacting, userBash)) {
          const cancel = await (dependencies.scheduleCleanup ?? scheduleCleanup)({ ...latest, cleanupSafe: true }, socket);
          if (!historyEver && canCleanup(latest, ctx, compacting, userBash)) ctx.shutdown();
          else cancel();
        }
      }
    } catch (error) { ctx.ui.notify(`Session operation failed: ${String(error)}`, "error"); }
    finally { open = false; }
  };

  const show = (ctx: ExtensionContext): Promise<void> => switchSession(ctx, async () => {
    const selection = await (dependencies.selectSession ?? (await import("./menu.ts")).selectSession)(ctx, registry!);
    if (selection === "new") {
      const project = await (dependencies.selectProject ?? (await import("./menu.ts")).selectProject)(ctx, registry!);
      if (!project) return false;
      await herdr!.create(project, pane!);
      return true;
    }
    if (!selection) return false;
    await herdr!.focus(selection);
    return selection.identity !== identity && selection.pane !== pane!.pane;
  });

  const createHere = (ctx: ExtensionContext): Promise<void> => switchSession(ctx, async () => {
    const project = await canonicalDirectory(ctx.cwd, ctx.cwd);
    await herdr!.create(project, pane!);
    return true;
  });

  pi.registerShortcut("ctrl+alt+s", { description: "Manage live Pi sessions", handler: show });
  pi.registerShortcut("ctrl+alt+n", { description: "Start Pi in a sibling pane for the current project", handler: createHere });
  pi.registerCommand("sessions", { description: "Manage live Pi sessions", handler: async (_args, ctx) => show(ctx) });
}
