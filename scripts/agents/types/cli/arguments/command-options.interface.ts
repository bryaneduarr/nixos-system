import type { ProviderId } from "../../usage/provider-usage.interface.ts";

/** Provider selection from the command line. */
type ProviderSelection =
  | {
      /** No `--provider` flag was given, so every provider applies. */
      readonly state: "all";
    }
  | {
      /** A `--provider` flag named the providers to show. */
      readonly state: "listed";
      /** Named providers in display order, without duplicates. */
      readonly providers: readonly ProviderId[];
    };

/** Flags read from the command line, before their combinations are checked. */
export interface CommandOptions {
  /** Whether `--help` or `-h` was given. */
  readonly help: boolean;
  /** Whether `--usage` was given. */
  readonly usage: boolean;
  /** Whether `--json` was given. */
  readonly json: boolean;
  /** Whether `--watch` was given. */
  readonly watch: boolean;
  /** Provider selection from `--provider`. */
  readonly providers: ProviderSelection;
  /** Flags that only apply with `--usage`, in the order they were given. */
  readonly usageOnlyFlags: readonly string[];
}

/** Result of reading the command line, discriminated by whether every token was valid. */
export type CommandOptionsRead =
  | {
      /** Every token was a known flag with a valid value. */
      readonly state: "read";
      /** Flags read from the command line. */
      readonly options: CommandOptions;
    }
  | {
      /** A token or value was rejected. */
      readonly state: "invalid";
      /** Reason shown to the user. */
      readonly message: string;
    };
