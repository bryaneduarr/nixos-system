import {
  HELP_FLAG,
  JSON_FLAG,
  LONG_OPTION_PREFIX,
  PROVIDER_FLAG,
  PROVIDER_FLAG_PREFIX,
  SHORT_HELP_FLAG,
  USAGE_FLAG,
  WATCH_FLAG,
} from "../../../constants/cli/command-flags.constant.ts";
import {
  PROVIDER_REPEATED_MESSAGE,
  PROVIDER_VALUE_MISSING_MESSAGE,
} from "../../../constants/cli/command-text.constant.ts";
import type { CommandOptions, CommandOptionsRead } from "../../../types/cli/arguments/command-options.interface.ts";
import { parseProviderOption } from "./parse-provider-option.service.ts";

const NO_COMMAND_OPTIONS: CommandOptions = {
  help: false,
  usage: false,
  json: false,
  watch: false,
  providers: { state: "all" },
  usageOnlyFlags: [],
};

function unknownArgumentMessage(argument: string): string {
  return `Unknown argument "${argument}". Run agents ${HELP_FLAG} to list options.`;
}

function addUsageOnlyFlag(options: CommandOptions, flag: string): CommandOptions {
  return { ...options, usageOnlyFlags: [...options.usageOnlyFlags, flag] };
}

function readProviderValue(value: string, tokens: readonly string[], options: CommandOptions): CommandOptionsRead {
  if (options.providers.state === "listed") return { state: "invalid", message: PROVIDER_REPEATED_MESSAGE };
  const parsedProviders = parseProviderOption(value);
  if (parsedProviders.state === "invalid") return { state: "invalid", message: parsedProviders.message };
  const listedOptions: CommandOptions = {
    ...options,
    providers: { state: "listed", providers: parsedProviders.providers },
  };
  return readOptionTokens(tokens, addUsageOnlyFlag(listedOptions, PROVIDER_FLAG));
}

function readProviderFlag(tokens: readonly string[], options: CommandOptions): CommandOptionsRead {
  const [valueToken, ...remainingTokens] = tokens;
  const isValueMissing = valueToken === undefined || valueToken.startsWith(LONG_OPTION_PREFIX);
  if (isValueMissing) return { state: "invalid", message: PROVIDER_VALUE_MISSING_MESSAGE };
  return readProviderValue(valueToken, remainingTokens, options);
}

function readUnmatchedToken(token: string, tokens: readonly string[], options: CommandOptions): CommandOptionsRead {
  if (token.startsWith(PROVIDER_FLAG_PREFIX)) {
    return readProviderValue(token.slice(PROVIDER_FLAG_PREFIX.length), tokens, options);
  }
  return { state: "invalid", message: unknownArgumentMessage(token) };
}

function readOptionTokens(tokens: readonly string[], options: CommandOptions): CommandOptionsRead {
  const [token, ...remainingTokens] = tokens;
  if (token === undefined) return { state: "read", options };
  switch (token) {
    case HELP_FLAG:
    case SHORT_HELP_FLAG:
      return readOptionTokens(remainingTokens, { ...options, help: true });
    case USAGE_FLAG:
      return readOptionTokens(remainingTokens, { ...options, usage: true });
    case JSON_FLAG:
      return readOptionTokens(remainingTokens, addUsageOnlyFlag({ ...options, json: true }, JSON_FLAG));
    case WATCH_FLAG:
      return readOptionTokens(remainingTokens, addUsageOnlyFlag({ ...options, watch: true }, WATCH_FLAG));
    case PROVIDER_FLAG:
      return readProviderFlag(remainingTokens, options);
    default:
      return readUnmatchedToken(token, remainingTokens, options);
  }
}

export function readCommandOptions(argv: readonly string[]): CommandOptionsRead {
  return readOptionTokens(argv, NO_COMMAND_OPTIONS);
}
