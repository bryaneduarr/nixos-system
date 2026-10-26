import type { ProviderId, ProviderUsage } from "../usage/provider-usage.interface.ts";

/** Usage statuses that show a message on their card instead of limit windows. */
export type MessageUsageStatus = Exclude<ProviderUsage["status"], "ok">;

/** Provider usage read that succeeded and reported limit windows. */
export type OkProviderUsage = Extract<ProviderUsage, { readonly status: "ok" }>;

/** Provider usage read that failed and carries a message for its card. */
export type MessageProviderUsage = Exclude<ProviderUsage, { readonly status: "ok" }>;

/** Settings shared by every card drawn in one render. */
export interface CardRenderOptions {
  /** Whether ANSI color escapes may be written. */
  readonly colorEnabled: boolean;
  /** Columns between a card's padding on each side, where its content is fitted. */
  readonly innerWidth: number;
  /** Moment reset countdowns are measured from. */
  readonly now: Date;
}

/** Text content of one provider card before it is boxed. */
export interface CardContent {
  /** Provider whose accent color outlines the card. */
  readonly provider: ProviderId;
  /** Plain title text, such as the display name and plan, truncated to fit when drawn. */
  readonly title: string;
  /** Lines shown below the title, already fitted to the inner width. */
  readonly bodyLines: readonly string[];
}

/** Inputs for drawing the border around one card's content. */
export interface DrawCardBoxInput {
  /** Content drawn inside the card. */
  readonly content: CardContent;
  /** Shared settings that set the card width and whether color is written. */
  readonly options: CardRenderOptions;
}
