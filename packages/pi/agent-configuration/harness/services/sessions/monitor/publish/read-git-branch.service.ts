import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { GIT_COMMAND_TIMEOUT_MS } from "../../../../constants/sessions/monitor/monitor.constant.ts";
import { NO_GIT_BRANCH } from "../../../../constants/sessions/registry/registry.constant.ts";

const execute = promisify(execFile);

export async function readGitBranch(cwd: string): Promise<string> {
  try {
    const { stdout } = await execute("git", ["-C", cwd, "symbolic-ref", "--quiet", "--short", "HEAD"], {
      timeout: GIT_COMMAND_TIMEOUT_MS,
    });
    return stdout.trim() || NO_GIT_BRANCH;
  } catch {
    return readDetachedRevision(cwd);
  }
}

async function readDetachedRevision(cwd: string): Promise<string> {
  try {
    const { stdout } = await execute("git", ["-C", cwd, "rev-parse", "--short", "HEAD"], {
      timeout: GIT_COMMAND_TIMEOUT_MS,
    });
    return `detached ${stdout.trim()}`;
  } catch {
    return NO_GIT_BRANCH;
  }
}
