import type { ReadUsageSnapshot } from "../../types/runtime/usage-snapshot.interface.ts";
import type { ProviderId, ProviderUsage } from "../../types/usage/provider-usage.interface.ts";
import { createFakeKeyInput, createFakeSignalSource } from "./quit-listener.test-double.ts";
import { createRecordingStream } from "./recording-terminal-stream.test-double.ts";
import { runAgents } from "./run-agents.service.ts";

export const NOW = new Date("2026-10-25T12:00:00Z");
const TERMINAL_COLUMNS = 100;

export const okUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "unreported" },
  windows: [{ label: "Weekly", percentRemaining: 80, resetsAt: "2026-10-28T16:12:00Z" }],
};

export const failedUsage: ProviderUsage = {
  status: "error",
  provider: "opencode",
  message: "OpenCode Go usage request failed with HTTP 500.",
};

interface RunScenario {
  readonly usages: readonly ProviderUsage[];
  readonly stdoutIsTTY: boolean;
  readonly stderrIsTTY: boolean;
  readonly stdinIsTTY: boolean;
  readonly environment: typeof process.env;
}

interface RunOutcome {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly requestedProviders: readonly (readonly ProviderId[])[];
}

export const PIPED: Omit<RunScenario, "usages"> = {
  stdoutIsTTY: false,
  stderrIsTTY: false,
  stdinIsTTY: false,
  environment: {},
};

export const TERMINAL: Omit<RunScenario, "usages"> = {
  stdoutIsTTY: true,
  stderrIsTTY: true,
  stdinIsTTY: true,
  environment: {},
};

export async function runAgentsWith(argv: readonly string[], scenario: RunScenario): Promise<RunOutcome> {
  const requestedProviders: (readonly ProviderId[])[] = [];
  const stdout = createRecordingStream({ isTTY: scenario.stdoutIsTTY, columns: TERMINAL_COLUMNS });
  const stderr = createRecordingStream({ isTTY: scenario.stderrIsTTY, columns: TERMINAL_COLUMNS });
  const readUsageSnapshot: ReadUsageSnapshot = async (providers) => {
    requestedProviders.push(providers);
    return { usages: scenario.usages, now: NOW };
  };
  const exitCode = await runAgents({
    argv,
    environment: scenario.environment,
    stdin: createFakeKeyInput(scenario.stdinIsTTY),
    stdout,
    stderr,
    signals: createFakeSignalSource(),
    wait: () => new Promise<void>(() => {}),
    readUsageSnapshot,
  });
  return {
    exitCode,
    stdout: stdout.writes.join(""),
    stderr: stderr.writes.join(""),
    requestedProviders,
  };
}
