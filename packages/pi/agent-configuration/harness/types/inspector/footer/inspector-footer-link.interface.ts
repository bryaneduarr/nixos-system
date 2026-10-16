import type { InspectorPage } from "../navigation/inspector-page.interface.ts";

/** A page link in the inspector footer. */
export interface InspectorFooterLink {
  /** Page the link opens. */
  readonly page: InspectorPage;
  /** Number key that opens the page. */
  readonly key: string;
  /** Label of the page. */
  readonly name: string;
}
