import type { ProviderId, ProviderUsage } from "../usage/provider-usage.interface.ts";

/** Usage read for the selected providers, with the moment reset countdowns are measured from. */
export interface UsageSnapshot {
  /** Provider usage reads, in display order. */
  readonly usages: readonly ProviderUsage[];
  /** Moment the provider environment was created for this read. */
  readonly now: Date;
}

/** Reads usage for the providers, creating a fresh provider environment for each read. */
export type ReadUsageSnapshot = (providers: readonly ProviderId[]) => Promise<UsageSnapshot>;
