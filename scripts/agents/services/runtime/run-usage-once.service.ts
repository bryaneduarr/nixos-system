import type { UsageCommand } from "../../types/cli/arguments/command-arguments.interface.ts";
import type { UsageRuntime } from "../../types/runtime/usage-runtime.interface.ts";
import { decideExitCode } from "../usage/exit-code/decide-exit-code.service.ts";
import { renderUsageOutput } from "./render-usage-output.service.ts";
import { showSpinnerWhileWaiting } from "./show-spinner-while-waiting.service.ts";

export async function runUsageOnce(command: UsageCommand, runtime: UsageRuntime): Promise<number> {
  const snapshotRead = runtime.readSnapshot(command.providers);
  const snapshot =
    command.output === "cards" ? await showSpinnerWhileWaiting(snapshotRead, runtime.stderr) : await snapshotRead;
  runtime.stdout.write(`${renderUsageOutput(command.output, snapshot, runtime.readSettings())}\n`);
  return decideExitCode(snapshot.usages);
}
