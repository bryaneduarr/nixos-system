import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function dedicatedShell(tab, pane, row, processInfo) {
  if (!tab || !pane || !processInfo) return false;
  if (tab.tab_id !== row.tab || tab.workspace_id !== row.workspace) return false;
  if (pane.pane_id !== row.pane || pane.tab_id !== row.tab || pane.workspace_id !== row.workspace) return false;
  if (pane.agent || pane.agent_session || processInfo.pane_id !== row.pane) return false;
  const processes = processInfo.foreground_processes;
  if (!Array.isArray(processes) || processes.length !== 1) return false;
  const shell = processes[0];
  if (row.mode === "explicit-exit" && processInfo.shell_pid !== row.shellPid) return false;
  return shell.pid === processInfo.shell_pid && /^(?:bash|zsh|fish|sh|dash|nu)$/.test(shell.name);
}

async function startIdentity(pid) {
  const text = await readFile(`/proc/${pid}/stat`, "utf8");
  return `${(await readFile("/proc/sys/kernel/random/boot_id", "utf8")).trim()}:${text.slice(text.lastIndexOf(")") + 2).split(" ")[19]}`;
}

export async function cleanupAfterExit(row, command, identity = startIdentity, wait = sleep) {
  if (
    !row.owned ||
    row.historyEver ||
    !row.cleanupSafe ||
    !row.processStart ||
    !Number.isSafeInteger(row.pid) ||
    row.pid < 1 ||
    typeof row.socket !== "string" ||
    !row.socket.startsWith("/") ||
    !/^w\d+:p\d+$/.test(row.pane) ||
    !/^w\d+:t\d+$/.test(row.tab)
  )
    return false;
  return closeAfterExit(row, command, identity, wait);
}

export async function explicitExitAfterExit(row, command, identity = startIdentity, wait = sleep) {
  if (
    row.mode !== "explicit-exit" ||
    !row.processStart ||
    !Number.isSafeInteger(row.pid) ||
    row.pid < 1 ||
    !Number.isSafeInteger(row.shellPid) ||
    row.shellPid < 1 ||
    row.shellPid === row.pid ||
    !row.shellStart ||
    typeof row.socket !== "string" ||
    !row.socket.startsWith("/") ||
    !/^w\d+:p\d+$/.test(row.pane) ||
    !/^w\d+:t\d+$/.test(row.tab) ||
    !/^w\d+$/.test(row.workspace) ||
    !row.pane.startsWith(`${row.workspace}:`) ||
    !row.tab.startsWith(`${row.workspace}:`)
  )
    return false;
  return closeAfterExit(row, command, identity, wait);
}

async function closeAfterExit(row, command, identity, wait) {
  let exited = false;
  for (let i = 0; i < 120; i++) {
    try {
      if ((await identity(row.pid)) !== row.processStart) return false;
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ESRCH") return false;
      exited = true;
      break;
    }
    await wait(500);
  }
  if (!exited) return false;
  for (let i = 0; i < 20; i++) {
    const tab = (await command(["tab", "get", row.tab])).tab;
    const pane = (await command(["pane", "get", row.pane])).pane;
    const processes = (await command(["pane", "process-info", "--pane", row.pane])).process_info;
    if (dedicatedShell(tab, pane, row, processes)) {
      const check = (await command(["tab", "get", row.tab])).tab;
      const current = (await command(["pane", "get", row.pane])).pane;
      const currentProcesses = (await command(["pane", "process-info", "--pane", row.pane])).process_info;
      if (!dedicatedShell(check, current, row, currentProcesses)) return false;
      if (row.mode === "explicit-exit") {
        try {
          if ((await identity(row.shellPid)) !== row.shellStart) return false;
        } catch {
          return false;
        }
      }
      await command(["pane", "close", row.pane]);
      return true;
    }
    await wait(500);
  }
  return false;
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2]) {
  const row = JSON.parse(process.argv[2]);
  const command = async (args) => {
    const { stdout } = await execute(process.env.HERDR_BIN_PATH || "herdr", args, {
      timeout: 5000,
      env: { ...process.env, HERDR_SOCKET_PATH: row.socket, HERDR_API_SOCKET: row.socket },
    });
    const response = JSON.parse(stdout);
    if (response.error) throw new Error("Herdr cleanup failed");
    return response.result;
  };
  const cleanup = row.mode === "explicit-exit" ? explicitExitAfterExit : cleanupAfterExit;
  cleanup(row, command).catch(() => {});
}
