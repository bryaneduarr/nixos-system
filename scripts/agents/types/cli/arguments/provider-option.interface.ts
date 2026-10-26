import type { ProviderId } from "../../usage/provider-usage.interface.ts";

/** Result of reading a `--provider` value, discriminated by whether every name was valid. */
export type ProviderOptionParse =
  | {
      /** Every name in the list is a known provider. */
      readonly state: "valid";
      /** Named providers in display order, without duplicates. */
      readonly providers: readonly ProviderId[];
    }
  | {
      /** The list is empty or contains a name that is not a provider. */
      readonly state: "invalid";
      /** Reason shown to the user. */
      readonly message: string;
    };
