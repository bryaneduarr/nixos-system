import type { ProviderUsage } from "../usage/provider-usage.interface.ts";

/** Inputs for drawing one card per provider. */
export interface RenderUsageCardsInput {
  /** Provider usage reads, drawn top to bottom in the order given. */
  readonly usages: readonly ProviderUsage[];
  /** Moment reset countdowns are measured from. */
  readonly now: Date;
  /** Whether ANSI color escapes may be written, decided by the caller. */
  readonly colorEnabled: boolean;
  /** Requested card width in terminal columns, raised to the minimum card width when smaller. */
  readonly width: number;
}
