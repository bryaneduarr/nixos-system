import { realpath } from "node:fs/promises";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { launchCleanupWorker } from "./cleanup.ts";
import { type HerdrCommand, type PaneIdentity, paneIdentity, scopedHerdr } from "./herdr.ts";
import { processStartIdentity } from "./registry.ts";

export interface ExitTarget extends PaneIdentity {
  mode: "explicit-exit";
  socket: string;
  pid: number;
  processStart: string;
  shellPid: number;
  shellStart: string;
}

export interface ExitDependencies {
  command?: (socket: string) => HerdrCommand;
  schedule?: (target: ExitTarget) => Promise<() => void>;
}

interface ExitState {
  generation: number;
  busy: boolean;
  requested: boolean;
  cancel?: () => void;
}

const stateKey = Symbol.for("pi.harness.explicitExit");
const globals = globalThis as typeof globalThis & { [stateKey]?: ExitState };
const state = (globals[stateKey] ??= { generation: 0, busy: false, requested: false });

export async function exitTarget(socket: string, command: HerdrCommand): Promise<ExitTarget> {
  if (!socket.startsWith("/")) throw new Error("Herdr socket must be an absolute path");
  const current = paneIdentity((await command(["pane", "current", "--current"])).pane);
  const pane = paneIdentity((await command(["pane", "get", current.pane])).pane);
  if (pane.pane !== current.pane || pane.tab !== current.tab || pane.workspace !== current.workspace)
    throw new Error("Current pane changed");
  const info = (await command(["pane", "process-info", "--pane", current.pane])).process_info as
    | Record<string, unknown>
    | undefined;
  const processes = info?.foreground_processes;
  const shellPid = info?.shell_pid;
  if (
    info?.pane_id !== current.pane ||
    !Number.isSafeInteger(shellPid) ||
    (shellPid as number) < 1 ||
    shellPid === process.pid ||
    !Array.isArray(processes) ||
    !processes.some((item) => item?.pid === process.pid)
  ) {
    throw new Error("Herdr cannot prove this Pi process belongs to the current shell pane");
  }
  const processStart = await processStartIdentity(process.pid);
  const shellStart = await processStartIdentity(shellPid as number);
  if (!processStart || !shellStart) throw new Error("Process start identities are unavailable");
  const check = paneIdentity((await command(["pane", "current", "--current"])).pane);
  if (check.pane !== current.pane || check.tab !== current.tab || check.workspace !== current.workspace)
    throw new Error("Current pane changed");
  return {
    ...current,
    mode: "explicit-exit",
    socket,
    pid: process.pid,
    processStart,
    shellPid: shellPid as number,
    shellStart,
  };
}

function discardReasons(ctx: ExtensionContext): string[] {
  const reasons: string[] = [];
  if (!ctx.isIdle() || ctx.signal) reasons.push("active work");
  if (ctx.hasPendingMessages()) reasons.push("pending messages");
  if (ctx.ui.getEditorText() !== "") reasons.push("the editor draft");
  return reasons;
}

export function installExit(pi: ExtensionAPI, dependencies: ExitDependencies = {}): void {
  pi.on("session_shutdown", (event) => {
    if (event.reason === "quit") return;
    state.generation++;
    state.cancel?.();
    state.cancel = undefined;
    state.busy = false;
    state.requested = false;
  });

  const exit = async (ctx: ExtensionContext): Promise<void> => {
    if (state.busy || state.requested) return;
    if (ctx.mode !== "tui") {
      ctx.ui.notify("/exit requires interactive Pi", "warning");
      return;
    }
    state.busy = true;
    const generation = state.generation;
    let cancel: (() => void) | undefined;
    try {
      const reasons = discardReasons(ctx);
      if (
        reasons.length &&
        !(await ctx.ui.confirm("Exit Pi?", `Discard ${reasons.join(", ")}? The saved conversation is kept.`))
      )
        return;
      if (generation !== state.generation) return;
      if (process.env.HERDR_ENV) {
        const socketPath = process.env.HERDR_SOCKET_PATH || process.env.HERDR_API_SOCKET;
        if (!socketPath) throw new Error("Herdr did not provide a socket");
        const socket = await realpath(socketPath);
        const command = dependencies.command?.(socket) ?? scopedHerdr(socket);
        const target = await exitTarget(socket, command);
        cancel = await (dependencies.schedule ?? launchCleanupWorker)(target);
      }
      if (generation !== state.generation) {
        cancel?.();
        return;
      }
      const changedReasons = discardReasons(ctx).filter((reason) => !reasons.includes(reason));
      if (changedReasons.length && !(await ctx.ui.confirm("Exit Pi?", `Also discard ${changedReasons.join(", ")}?`))) {
        cancel?.();
        return;
      }
      if (generation !== state.generation) {
        cancel?.();
        return;
      }
      state.cancel = cancel;
      if (cancel)
        ctx.ui.notify(
          "Exiting Pi. If the pane stays open, the helper could not verify safe closure. Check its processes before closing it manually.",
          "info",
        );
      state.requested = true;
      ctx.shutdown();
      ctx.abort();
    } catch (error) {
      cancel?.();
      if (generation !== state.generation) return;
      state.cancel = undefined;
      state.requested = false;
      ctx.ui.notify(
        `Exit cancelled: ${String(error)}. Check the Herdr socket and pane process information, then retry /exit. Use Pi's built-in Ctrl+D to exit without closing the pane.`,
        "error",
      );
    } finally {
      if (generation === state.generation) state.busy = false;
    }
  };

  pi.registerCommand("exit", {
    description: "Exit Pi and safely close its Herdr pane",
    handler: async (_args, ctx) => exit(ctx),
  });
  pi.registerShortcut("ctrl+alt+q", { description: "Exit Pi and safely close its Herdr pane", handler: exit });
}
