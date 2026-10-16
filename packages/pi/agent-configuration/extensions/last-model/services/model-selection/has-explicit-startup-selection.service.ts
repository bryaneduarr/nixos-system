import {
  EXPLICIT_STARTUP_ARGUMENT_PREFIXES,
  EXPLICIT_STARTUP_ARGUMENTS,
} from "../../constants/startup/explicit-startup-argument.constant.ts";

export function hasExplicitStartupSelection(): boolean {
  return process.argv.slice(2).some((argument) => {
    const isExplicitArgument = EXPLICIT_STARTUP_ARGUMENTS.includes(argument);
    const hasExplicitPrefix = EXPLICIT_STARTUP_ARGUMENT_PREFIXES.some((prefix) => argument.startsWith(prefix));
    return isExplicitArgument || hasExplicitPrefix;
  });
}
