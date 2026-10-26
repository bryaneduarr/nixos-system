import { PROVIDER_ORDER } from "../usage/provider-order.constant.ts";

export const PROVIDER_NAMES_TEXT = PROVIDER_ORDER.join(", ");
export const JSON_WITH_WATCH_MESSAGE = "--json cannot be combined with --watch.";
export const PROVIDER_VALUE_MISSING_MESSAGE = "--provider requires a value, such as --provider claude,opencode.";
export const PROVIDER_VALUE_EMPTY_MESSAGE = "--provider requires at least one provider name.";
export const PROVIDER_REPEATED_MESSAGE = "--provider can be given only once; separate names with commas.";
export const HELP_HINT_MESSAGE = "Run agents --help.";
export const WATCH_REQUIRES_TERMINAL_MESSAGE = "--watch needs an interactive terminal for input and output.";
