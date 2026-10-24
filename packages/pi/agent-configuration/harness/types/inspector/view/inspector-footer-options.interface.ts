import type { Theme } from "@earendil-works/pi-coding-agent";
import type { InspectorPage } from "../navigation/inspector-page.interface.ts";

/** Inputs for the footer line of the inspector. */
export interface InspectorFooterOptions {
  /** Page currently shown. */
  readonly page: InspectorPage;
  /** Status message shown after the page links. */
  readonly status: string;
  /** Width of the footer in columns. */
  readonly width: number;
  /** Theme used for colors. */
  readonly theme: Theme;
}
