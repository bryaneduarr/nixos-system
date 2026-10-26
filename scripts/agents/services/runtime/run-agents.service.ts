import { HELP_HINT_MESSAGE, WATCH_REQUIRES_TERMINAL_MESSAGE } from "../../constants/cli/command-text.constant.ts";
import { INVALID_COMMAND_EXIT_CODE, SUCCESS_EXIT_CODE } from "../../constants/runtime/exit-code.constant.ts";
import type { UsageCommand } from "../../types/cli/arguments/command-arguments.interface.ts";
import type { RunAgentsInput } from "../../types/runtime/run-agents.interface.ts";
import type { TerminalStream } from "../../types/runtime/terminal-settings.interface.ts";
import type { UsageRuntime } from "../../types/runtime/usage-runtime.interface.ts";
import { parseCommandArguments } from "../cli/arguments/parse-command-arguments.service.ts";
import { buildHelpText } from "../cli/help/build-help-text.service.ts";
import { readTerminalSettings } from "./read-terminal-settings.service.ts";
import { runUsageOnce } from "./run-usage-once.service.ts";
import { runUsageWatch } from "./run-usage-watch.service.ts";

function reportInvalidCommand(stderr: TerminalStream, message: string): number {
  stderr.write(`${message}\n${HELP_HINT_MESSAGE}\n`);
  return INVALID_COMMAND_EXIT_CODE;
}

async function runUsageCommand(command: UsageCommand, input: RunAgentsInput): Promise<number> {
  const runtime: UsageRuntime = {
    readSettings: () => readTerminalSettings({ environment: input.environment, stdout: input.stdout }),
    stdout: input.stdout,
    stderr: input.stderr,
    readSnapshot: input.readUsageSnapshot,
  };
  if (!command.watch) return runUsageOnce(command, runtime);
  const isInteractiveTerminal = input.stdout.isTTY && input.stdin.isTTY;
  if (!isInteractiveTerminal) return reportInvalidCommand(input.stderr, WATCH_REQUIRES_TERMINAL_MESSAGE);
  await runUsageWatch(command, { ...runtime, stdin: input.stdin, signals: input.signals, wait: input.wait });
  return SUCCESS_EXIT_CODE;
}

export async function runAgents(input: RunAgentsInput): Promise<number> {
  const command = parseCommandArguments(input.argv);
  switch (command.command) {
    case "help":
      input.stdout.write(`${buildHelpText()}\n`);
      return SUCCESS_EXIT_CODE;
    case "invalid":
      return reportInvalidCommand(input.stderr, command.message);
    case "usage":
      return runUsageCommand(command, input);
    default: {
      const unhandledCommand: never = command;
      return unhandledCommand;
    }
  }
}
