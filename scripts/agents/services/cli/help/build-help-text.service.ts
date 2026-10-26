import {
  HELP_FLAG,
  JSON_FLAG,
  PROVIDER_FLAG,
  SHORT_HELP_FLAG,
  USAGE_FLAG,
  WATCH_FLAG,
} from "../../../constants/cli/command-flags.constant.ts";
import { PROVIDER_NAMES_TEXT } from "../../../constants/cli/command-text.constant.ts";

const OPTION_COLUMN_WIDTH = 22;

function formatOptionLine(label: string, description: string): string {
  return `  ${label.padEnd(OPTION_COLUMN_WIDTH)}${description}`;
}

export function buildHelpText(): string {
  return [
    `Usage: agents ${USAGE_FLAG} [${JSON_FLAG} | ${WATCH_FLAG}] [${PROVIDER_FLAG} <names>]`,
    "",
    "Options:",
    formatOptionLine(USAGE_FLAG, "Show usage limits for the selected providers."),
    formatOptionLine(JSON_FLAG, "Print usage as JSON. Cannot be combined with --watch."),
    formatOptionLine(WATCH_FLAG, "Refresh usage every 60 seconds. Press q or Ctrl-C to quit."),
    formatOptionLine(`${PROVIDER_FLAG} <names>`, "Comma-separated providers to show, such as claude,opencode."),
    formatOptionLine(`${HELP_FLAG}, ${SHORT_HELP_FLAG}`, "Show this help."),
    "",
    `Providers: ${PROVIDER_NAMES_TEXT}`,
    "",
    "Example:",
    `  agents ${USAGE_FLAG} ${PROVIDER_FLAG} claude,opencode`,
  ].join("\n");
}
