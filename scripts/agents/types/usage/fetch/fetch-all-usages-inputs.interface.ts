import type { ProviderEnvironment } from "../../providers/provider-environment.interface.ts";
import type { ProviderId } from "../provider-usage.interface.ts";

/** Inputs for reading usage from a set of providers in one pass. */
export interface FetchAllUsagesInputs {
  /** Providers to read; providers left out are never started. */
  readonly providers: readonly ProviderId[];
  /** Machine state the providers read from, such as the home directory and HTTP client. */
  readonly environment: ProviderEnvironment;
}
