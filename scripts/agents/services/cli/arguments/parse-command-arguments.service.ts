import { USAGE_FLAG } from "../../../constants/cli/command-flags.constant.ts";
import { JSON_WITH_WATCH_MESSAGE } from "../../../constants/cli/command-text.constant.ts";
import { PROVIDER_ORDER } from "../../../constants/usage/provider-order.constant.ts";
import type { CommandArguments } from "../../../types/cli/arguments/command-arguments.interface.ts";
import type { CommandOptions } from "../../../types/cli/arguments/command-options.interface.ts";
import { readCommandOptions } from "./read-command-options.service.ts";

function usageOnlyFlagsMessage(flags: readonly string[]): string {
  return `${[...new Set(flags)].join(", ")} can only be used with ${USAGE_FLAG}.`;
}

function commandWithoutUsage(options: CommandOptions): CommandArguments {
  if (options.usageOnlyFlags.length === 0) return { command: "help" };
  return { command: "invalid", message: usageOnlyFlagsMessage(options.usageOnlyFlags) };
}

function toCommandArguments(options: CommandOptions): CommandArguments {
  if (options.help) return { command: "help" };
  if (options.json && options.watch) return { command: "invalid", message: JSON_WITH_WATCH_MESSAGE };
  if (!options.usage) return commandWithoutUsage(options);
  return {
    command: "usage",
    output: options.json ? "json" : "cards",
    watch: options.watch,
    providers: options.providers.state === "listed" ? options.providers.providers : PROVIDER_ORDER,
  };
}

export function parseCommandArguments(argv: readonly string[]): CommandArguments {
  const read = readCommandOptions(argv);
  if (read.state === "invalid") return { command: "invalid", message: read.message };
  return toCommandArguments(read.options);
}
