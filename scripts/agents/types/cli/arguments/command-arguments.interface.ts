import type { ProviderId } from "../../usage/provider-usage.interface.ts";

/** Format the usage is printed in: display cards or JSON. */
export type UsageOutput = "cards" | "json";

/** Command that prints the help text and exits. */
interface HelpCommand {
  /** Discriminator identifying the help command. */
  readonly command: "help";
}

/** Command that prints usage limits for the selected providers. */
export interface UsageCommand {
  /** Discriminator identifying the usage command. */
  readonly command: "usage";
  /** Format the usage is printed in. */
  readonly output: UsageOutput;
  /** Whether usage refreshes until the user quits. */
  readonly watch: boolean;
  /** Providers to read, in display order without duplicates. */
  readonly providers: readonly ProviderId[];
}

/** Command line that cannot run as typed. */
interface InvalidCommand {
  /** Discriminator identifying an invalid command line. */
  readonly command: "invalid";
  /** Reason shown to the user. */
  readonly message: string;
}

/** Parsed command line, discriminated by the command it requests. */
export type CommandArguments = HelpCommand | UsageCommand | InvalidCommand;
